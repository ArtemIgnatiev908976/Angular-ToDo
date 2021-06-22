import {Component, OnInit} from '@angular/core';
import {DataHandlerService} from "./service/data-handler.service";
import {Task} from './model/Task';
import {Category} from "./model/Category";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styles: []
})
export class AppComponent implements OnInit {

  title = 'Todo';
  tasks: Task[];
  categories: Category[];

  private selectedCategory: Category = null;


  constructor(
    private dataHandler: DataHandlerService, // фасад для работы с данными
  ) {
  }

  ngOnInit(): void {
    // this.dataHandler.getAllTasks().subscribe(tasks => this.tasks = tasks);
    this.dataHandler.getAllCategories().subscribe(categories => this.categories = categories);

    this.onSelectCategory(null); // показать все задачи

  }


  // изменение категории
  public onSelectCategory(category: Category) {

    this.selectedCategory = category;

    this.dataHandler.searchTasks(
      this.selectedCategory,
      null,
      null,
      null
    ).subscribe(tasks => {
      this.tasks = tasks;
    });

  }


  // обновление задачи
  public onUpdateTask(task: Task) {

    this.dataHandler.updateTask(task).subscribe(() => {
      this.dataHandler.searchTasks(
        this.selectedCategory,
        null,
        null,
        null
      ).subscribe(tasks => {
        this.tasks = tasks;
      });
    });

  }
}
