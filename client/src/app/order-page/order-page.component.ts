import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {MaterialInstance, MaterialService} from "../shared/classes/material.service";
import {Subscription} from "rxjs";

import {OrderService} from "./order.service";
import {Order, OrderPosition} from "../shared/interfaces";
import {OrdersService} from "../shared/services/orders.service";

@Component({
  selector: 'app-order-page',
  templateUrl: './order-page.component.html',
  styleUrls: ['./order-page.component.css'],
  providers: [OrderService]
})
export class OrderPageComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('modal') modalRef: ElementRef
  isRoot: boolean
  modal: MaterialInstance
  pending = false
  oSub: Subscription

  constructor(private router: Router,
              private order: OrderService,
              private ordersService: OrdersService) {
  }

  ngOnInit() {
    this.isRoot = this.router.url === '/order'
    this.router.events.subscribe(event =>{
      if (event instanceof NavigationEnd) {
        this.isRoot = this.router.url === '/order'
      }
    })
  }

  ngOnDestroy() {
    this.modal.destroy()
    if (this.oSub) {
      this.oSub.unsubscribe()
    }
  }

  ngAfterViewInit() {
    //создаем модальное окно
    this.modal = MaterialService.initModal(this.modalRef)
  }

  open() {
    this.modal.open()
  }

  cancel() {
    this.modal.close()
  }

  removePosition(orderPosition: OrderPosition) {
    this.order.remove(orderPosition)
  }

  submit() {
    //начало загрузки, ты мы указыаем что происходит отправка заказа
    this.pending = true
    const order: Order = {
      //у каждого массива есть метод map, который для каждой итерации в коллбак функции будет записываться в переменную item.
      //так как на бакенде у нас в модели нет поля _id в списке, то его здесь мы просто удалим
      //и еще на фронтенде обязательным полем для заполнения является только поле list у объекта Order. Остальные поля заполняется на бакенде
      list: this.order.list.map(item => {
        delete item._id
        return item
      })
    }
    this.oSub = this.ordersService.create(order).subscribe(
      newOrder => {
        MaterialService.toast(`Заказ №${newOrder.order} успешно добавлен`)
        this.order.clear()
      },
      error => MaterialService.toast(error.error.message),
      () => {
        this.modal.close()
        this.pending = false
      }
    )
  }
}
