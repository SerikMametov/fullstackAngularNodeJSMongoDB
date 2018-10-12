import {Component, OnInit} from '@angular/core';

import {CategoriesService} from "../shared/services/categories.service";
import {Category} from "../shared/interfaces";
import {Observable} from "rxjs";

@Component({
  selector: 'app-categories-page',
  templateUrl: './categories-page.component.html',
  styleUrls: ['./categories-page.component.css']
})
export class CategoriesPageComponent implements OnInit {
  //знак $ - является rxjs стримов, асинхроным стримом
  categories$: Observable<Category[]>

  constructor(private categoriesService: CategoriesService) {
  }

  ngOnInit() {
    //здесь нет подписки, так как подписка произойдет в самом шаблоне. т.е. в шаблоне быдет написано *ngIf="categories$ | async as categories; else loader"
    // что означает что здесь просиходит подписка, т.е метод сабскрайб который обычно делался в компоненте,
    // теперь будет просиходит здесь в шаблоне благодаря async пайму
    this.categories$ = this.categoriesService.fetch()
  }



}
