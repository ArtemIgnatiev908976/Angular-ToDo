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


  public title = 'Todo';
  public tasks: Task[];
  public categories: Category[]; // все категории


  public selectedCategory: Category = null;

  // поиск
  public searchTaskText = ''; // текущее значение для поиска задач

  // фильтрация
  public statusFilter: boolean;



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

    this.updateTasks();

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

  // удаление задачи
  public onDeleteTask(task: Task) {

    this.dataHandler.deleteTask(task.id).subscribe(() => {
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

  // удаление категории
  public onDeleteCategory(category: Category) {
    this.dataHandler.deleteCategory(category.id).subscribe(cat => {
      this.selectedCategory = null; // открываем категорию "Все"
      this.onSelectCategory(this.selectedCategory);
    });
  }

  // обновлении категории
  public onUpdateCategory(category: Category) {
    this.dataHandler.updateCategory(category).subscribe(() => {
      this.onSelectCategory(this.selectedCategory);
    });
  }



  // поиск задач
  public onSearchTasks(searchString: string) {
    this.searchTaskText = searchString;
    this.updateTasks();
  }

  // фильтрация задач по статусу (все, решенные, нерешенные)
  public onFilterTasksByStatus(status: boolean) {
    this.statusFilter = status;
    this.updateTasks();
  }


  public updateTasks() {
    this.dataHandler.searchTasks(
      this.selectedCategory,
      this.searchTaskText,
      this.statusFilter,
      null
    ).subscribe((tasks: Task[]) => {
      this.tasks = tasks;
    });
  }



}
