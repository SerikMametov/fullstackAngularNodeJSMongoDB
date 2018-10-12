import {AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";

import {PositionsService} from "../../../shared/services/positions.service";
import {MaterialInstance, MaterialService} from "../../../shared/classes/material.service";
import {Position} from "../../../shared/interfaces";

@Component({
  selector: 'app-positions-form',
  templateUrl: './positions-form.component.html',
  styleUrls: ['./positions-form.component.css']
})
export class PositionsFormComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input('categoryId') categoryId: string
  @ViewChild('modal') modalRef: ElementRef

  positions: Position[] = []
  loading = false
  modal: MaterialInstance
  form: FormGroup
  positionId = null

  constructor(private positionsService: PositionsService) { }

  ngOnInit() {

    this.form = new FormGroup({
      name: new FormControl(null, Validators.required),
      cost: new FormControl(1, [Validators.required, Validators.min(1)])
    })

    this.loading = true
    this.positionsService.fetch(this.categoryId)
      .subscribe(positions => {
        this.positions = positions
        this.loading = false
      })
  }

  ngAfterViewInit() {
   this.modal = MaterialService.initModal(this.modalRef)
  }

  onAddPosition() {
    this.positionId = null
    this.form.reset({name: null, cost: 1})
    this.modal.open()
    MaterialService.updateTextInputs()
  }

  onSelectPosition(position: Position) {
    this.positionId = position._id
    this.form.patchValue({
      name: position.name,
      cost: position.cost
    })
    this.modal.open()
    MaterialService.updateTextInputs()
  }

  onCancel() {
    this.modal.close()
  }

  onSubmit() {
    this.form.disable()

    const newPosition: Position = {
      name: this.form.value.name,
      cost: this.form.value.cost,
      category: this.categoryId
    }

    const completed =() => {
      this.modal.close()
      this.form.reset({name: '', cost: 1})
      this.form.enable()
    }

    if (this.positionId) {
      newPosition._id = this.positionId
      this.positionsService.update(newPosition)
        .subscribe(
          position => {
            const idx = this.positions.findIndex(p => p._id === position._id)
            this.positions[idx] = position
            MaterialService.toast('Изменение позиции прошло успешно!')
          },
          error => {
            MaterialService.toast(error.error.message)
          },
          completed
        )
    } else {
      this.positionsService.create(newPosition)
        .subscribe(
          position => {
            MaterialService.toast('Позиция успешно создана!')
            this.positions.push(position)
          },
          error => {
            MaterialService.toast(error.error.message)
          },
          completed
        )
    }


  }

  onDeletePosition(event: Event, position: Position) {
    //event.stopPropagation() так как удаление находится внутри тега <a а на его клике написан код по открытию формы, то и после удаление форма автоматом открывалась. Что бы такого
    // не было написан этот код, это означает не праваливатся дальше никуда а выполнить только свой локадьный код
    event.stopPropagation()
    const decision = window.confirm(`Вы действительно хотите удалить "${position.name}" позицию?`)
    if (decision) {
      this.positionsService.delete(position).subscribe(
        responce => {
          const idx = this.positions.findIndex(p => p._id === position._id)
          this.positions.splice(idx, 1)
          MaterialService.toast(responce.message)
        },
        error => MaterialService.toast(error.error.message)
      )
    }
  }

  ngOnDestroy() {
    this.modal.destroy()
  }

}
