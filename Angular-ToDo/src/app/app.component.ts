import {Component, OnInit} from '@angular/core';
import {DataHandlerService} from "./service/data-handler.service";
import {Task} from './model/Task';
import {Category} from "./model/Category";
import {Priority} from "./model/Priority";
import {zip} from "rxjs";
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styles: []
})
export class AppComponent implements OnInit {

  public title = 'Todo';
  public tasks: Task[];
  public categories: Category[]; // все категории
  public priorities: Priority[]; // все приоритеты


  // статистика
  public totalTasksCountInCategory: number;
  public completedCountInCategory: number;
  public uncompletedCountInCategory: number;
  public uncompletedTotalTasksCount: number;



  public selectedCategory: Category = null;

  // поиск
  public searchTaskText = ''; // текущее значение для поиска задач
  public searchCategoryText = ''; // текущее значение для поиска категорий
  // фильтрация
  private priorityFilter: Priority;
  private statusFilter: boolean;


  constructor(
    private dataHandler: DataHandlerService, // фасад для работы с данными
  ) {
  }

  ngOnInit(): void {
    this.dataHandler.getAllPriorities().subscribe(priorities => this.priorities = priorities);
    this.dataHandler.getAllCategories().subscribe(categories => this.categories = categories);

    this.onSelectCategory(null); // показать все задачи

  }


  // изменение категории
  public onSelectCategory(category: Category) {

    this.selectedCategory = category;

    this.updateTasksAndStat();

  }

  // удаление категории
  public onDeleteCategory(category: Category) {
    this.dataHandler.deleteCategory(category.id).subscribe(cat => {
      this.selectedCategory = null; // открываем категорию "Все"
      this.onSelectCategory(null);
    });
  }

  // обновлении категории
  public onUpdateCategory(category: Category) {
    this.dataHandler.updateCategory(category).subscribe(() => {
      this.onSearchCategory(this.searchCategoryText);
    });
  }





  // обновление задачи
  public onUpdateTask(task: Task) {

    this.updateTasksAndStat();

  }

  // удаление задачи
  public onDeleteTask(task: Task) {

    this.dataHandler.deleteTask(task.id).subscribe(cat => {
      this.updateTasksAndStat()
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

  // фильтрация задач по приоритету
  public onFilterTasksByPriority(priority: Priority) {
    this.priorityFilter = priority;
    this.updateTasks();
  }

  private updateTasks() {
    this.dataHandler.searchTasks(
      this.selectedCategory,
      this.searchTaskText,
      this.statusFilter,
      this.priorityFilter
    ).subscribe((tasks: Task[]) => {
      this.tasks = tasks;
    });
  }



  // добавление задачи
  public onAddTask(task: Task) {

    this.dataHandler.addTask(task).subscribe(result => {

      this.updateTasksAndStat();

    });

  }

  // добавление категории
  public onAddCategory(title: string) {
    this.dataHandler.addCategory(title).subscribe(() => this.updateCategories());
  }

  public updateCategories() {
    this.dataHandler.getAllCategories().subscribe(categories => this.categories = categories);
  }


  // поиск категории
  public onSearchCategory(title: string) {

    this.searchCategoryText = title;

    this.dataHandler.searchCategories(title).subscribe(categories => {
      this.categories = categories;
    });
  }
  // показывает задачи с применением всех текущий условий (категория, поиск, фильтры и пр.)
  public updateTasksAndStat() {

    this.updateTasks(); // обновить список задач

    // обновить переменные для статистики
    this.updateStat();

  }

  // обновить статистику
  public updateStat() {
    zip(
      this.dataHandler.getTotalCountInCategory(this.selectedCategory),
      this.dataHandler.getCompletedCountInCategory(this.selectedCategory),
      this.dataHandler.getUncompletedCountInCategory(this.selectedCategory),
      this.dataHandler.getUncompletedTotalCount())

      .subscribe(array => {
        this.totalTasksCountInCategory = array[0];
        this.completedCountInCategory = array[1];
        this.uncompletedCountInCategory = array[2];
        this.uncompletedTotalTasksCount = array[3]; // нужно для категории Все
      });
  }


}
