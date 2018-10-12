import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Params, Router} from "@angular/router";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {switchMap} from "rxjs/operators";
import {of} from "rxjs";

import {CategoriesService} from "../../shared/services/categories.service";
import {MaterialService} from "../../shared/classes/material.service";
import {Category} from "../../shared/interfaces";

@Component({
  selector: 'app-categories-form',
  templateUrl: './categories-form.component.html',
  styleUrls: ['./categories-form.component.css']
})
export class CategoriesFormComponent implements OnInit {

  @ViewChild('input') inputRef: ElementRef
  form: FormGroup
  isNew = true
  image: File
  imagePreview = ''
  category: Category

  constructor(private route: ActivatedRoute,
              private categoriesService: CategoriesService,
              private router: Router) { }

  ngOnInit() {
    this.form = new FormGroup({
      name: new FormControl(null, Validators.required)
    })

    this.form.disable()

    //как только мы считали парамс, мы не хотим на него подписываться, а хотим дальше вызвать другой код. поэтому и существует метод pipe в rxjs
    this.route.params
      .pipe(
        switchMap(
          (params: Params) => {
            if (params['id']) {
              this.isNew = false
              return this.categoriesService.getById(params['id'])
            }
            //метод of позваоляет вернуть Observable из чего угодно, а нам в функции switchMap как раз таки и надо вернуть некий стрим
            return of(null)
          }
        )
      )
      .subscribe(
        (category: Category) => {
          if (category) {
            this.category = category
            //с помощью метода patchValue можно сразу же передать форме данные которые мы хотим изменить
            this.form.patchValue({
              name: category.name
            })
            this.imagePreview =category.imageSrc
            MaterialService.updateTextInputs()
          }
          this.form.enable()
        },
        error => MaterialService.toast(error.error.message)
      )
  }

  triggerClick() {
    this.inputRef.nativeElement.click()
  }

  onFileUpload(event: any) {
    const file = event.target.files[0]
    this.image = file
    //FileReader - стандартный класс джаваскрипта
    const reader = new FileReader()
    reader.onload =() => {
      this.imagePreview = reader.result
    }
    reader.readAsDataURL(file)
  }

  onSubmit() {
    let obs$
    this.form.disable()
    if (this.isNew) {
      obs$ = this.categoriesService.create(this.form.value.name, this.image)
    } else {
      obs$ = this.categoriesService.update(this.category._id, this.form.value.name, this.image)
    }

    obs$.subscribe(
      category => {
        this.category = this.category
      this.form.enable()
      MaterialService.toast('Изменения успешно сохранены')
    },
    error => {
      this.form.enable()
      MaterialService.toast(error.error.message)
    }

    )
  }

  deleteCategory() {
    const decision = window.confirm(`Вы уверены, что хотите удалить категорию "${this.category.name}"`)
    if (decision) {
      this.categoriesService.delete(this.category._id)
        .subscribe(
          responce => MaterialService.toast(responce.message),
          error => MaterialService.toast(error.error.message),
          () => this.router.navigate(['/categories'])
        )
    }
  }

}
