import {Component, OnInit} from '@angular/core';
import {DataHandlerService} from "../../service/data-handler.service";
import {Category} from "../../model/Category";

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {

  categories: Category[];
  selectedCategory: Category;

  constructor(private dataHandler: DataHandlerService) {
  }


  //Метод вызывается после инициализации компонента
  ngOnInit(): void {
    this.dataHandler.categoriesSubject.subscribe(categories => this.categories = categories)
    console.log(this.categories)
  }
//Метод вызывается после инициализации компонента

  showTasksByCategory(category: Category) {
    this.selectedCategory = category;
    this.dataHandler.fillTasksByCategory(category)
  }
}
