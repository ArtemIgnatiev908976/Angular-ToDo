import {Component, OnInit} from '@angular/core';
import {DataHandlerService} from "./service/data-handler.service";
import {Task} from './model/Task';
import {Category} from "./model/Category";
import {Priority} from "./model/Priority";
import {zip} from "rxjs";
import {concatMap, map} from "rxjs/operators";
import {IntroService} from "./service/intro.service";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styles: []
})
export class AppComponent implements OnInit {

  // коллекция категорий с кол-вом незавершенных задач для каждой из них
  public categoryMap = new Map<Category, number>();

  public tasks: Task[];
  public categories: Category[]; // все категории
  public priorities: Priority[]; // все приоритеты

  // статистика
  public totalTasksCountInCategory: number;
  public completedCountInCategory: number;
  public uncompletedCountInCategory: number;
  public uncompletedTotalTasksCount: number;

  // показать/скрыть статистику
  public showStat = true;

  // выбранная категория
  public selectedCategory: Category = null;

  // поиск
  private searchTaskText = ''; // текущее значение для поиска задач
  private searchCategoryText = ''; // текущее значение для поиска категорий


  // фильтрация
  private priorityFilter: Priority;
  private statusFilter: boolean;


  // параметры бокового меню с категориями
  public menuOpened // открыть-закрыть
  public menuMode // тип выдвижения (поверх, с толканием и пр.)
  public menuPosition // сторона
  public showBackdrop // показывать фоновое затемнение или нет


  constructor(
    private dataHandler: DataHandlerService, // фасад для работы с данными
    private introService: IntroService //вводная справочная информаия с выделением обоастей
  ) {
  }

  ngOnInit() {
    this.dataHandler.getAllPriorities().subscribe(priorities => this.priorities = priorities);
    this.dataHandler.getAllCategories().subscribe(categories => this.categories = categories);

    // заполнить меню с категориями
    this.fillCategories();

    this.onSelectCategory(null); // показать все задачи

    this.introService.startIntroJS(true)
  }


  // добавление категории
  public onAddCategory(title: string): void {
    this.dataHandler.addCategory(title).subscribe(() => this.fillCategories());
  }

  // private fillCategories(): void {
  //     this.dataHandler.getAllCategories().subscribe(categories => this.categories = categories);
  // }

  // заполняет категории и кол-во невыполненных задач по каждой из них (нужно для отображения категорий)
  private fillCategories() {

    if (this.categoryMap) {
      this.categoryMap.clear();
    }

    this.categories = this.categories.sort((a, b) => a.title.localeCompare(b.title));

    // для каждой категории посчитать кол-во невыполненных задач

    this.categories.forEach(cat => {
      this.dataHandler.getUncompletedCountInCategory(cat).subscribe(count => this.categoryMap.set(cat, count));
    });

  }

  // поиск категории
  public onSearchCategory(title: string): void {

    this.searchCategoryText = title;

    this.dataHandler.searchCategories(title).subscribe(categories => {
      this.categories = categories;
      this.fillCategories();
    });
  }


  // изменение категории
  public onSelectCategory(category: Category): void {

    this.selectedCategory = category;

    this.updateTasksAndStat();

  }

  // // удаление категории
  // private onDeleteCategory(category: Category): void {
  //     this.dataHandler.deleteCategory(category.id).subscribe(cat => {
  //         this.selectedCategory = null; // открываем категорию "Все"
  //         this.onSelectCategory(null);
  //     });
  // }

  // удаление категории
  public onDeleteCategory(category: Category) {
    this.dataHandler.deleteCategory(category.id).subscribe(cat => {
      this.selectedCategory = null; // открываем категорию "Все"
      this.categoryMap.delete(cat); // не забыть удалить категорию из карты
      this.onSearchCategory(this.searchCategoryText);
      this.updateTasks();
    });
  }

  // обновлении категории
  public onUpdateCategory(category: Category): void {
    this.dataHandler.updateCategory(category).subscribe(() => {
      this.onSearchCategory(this.searchCategoryText);
    });
  }

  // обновление задачи
  public onUpdateTask(task: Task): void {

    this.dataHandler.updateTask(task).subscribe(() => {

      this.fillCategories();

      this.updateTasksAndStat();
    });

  }

  // // удаление задачи
  // private onDeleteTask(task: Task): void {
  //
  //     this.dataHandler.deleteTask(task.id).subscribe(cat => {
  //         this.updateTasksAndStat();
  //     });
  // }

  // удаление задачи
  public onDeleteTask(task: Task) {

    this.dataHandler.deleteTask(task.id).pipe(
      concatMap(task => {
          return this.dataHandler.getUncompletedCountInCategory(task.category).pipe(map(count => {
            return ({t: task, count});
          }));
        }
      )).subscribe(result => {

      const t = result.t as Task;
      this.categoryMap.set(t.category, result.count);

      this.updateTasksAndStat();

    });


  }


  // поиск задач
  public onSearchTasks(searchString: string): void {
    this.searchTaskText = searchString;
    this.updateTasks();
  }

  // фильтрация задач по статусу (все, решенные, нерешенные)
  public onFilterTasksByStatus(status: boolean): void {
    this.statusFilter = status;
    this.updateTasks();
  }

  // фильтрация задач по приоритету
  public onFilterTasksByPriority(priority: Priority): void {
    this.priorityFilter = priority;
    this.updateTasks();
  }

  private updateTasks(): void {
    this.dataHandler.searchTasks(
      this.selectedCategory,
      this.searchTaskText,
      this.statusFilter,
      this.priorityFilter
    ).subscribe((tasks: Task[]) => {
      this.tasks = tasks;
    });
  }


  // // добавление задачи
  // private onAddTask(task: Task): void {
  //
  //     this.dataHandler.addTask(task).subscribe(refsult => {
  //
  //         this.updateTasksAndStat();
  //
  //     });
  //
  // }

  // добавление задачи
  public onAddTask(task: Task) {


    this.dataHandler.addTask(task).pipe(// сначала добавляем задачу
      concatMap(task => { // используем добавленный task (concatMap - для последовательного выполнения)
          // .. и считаем кол-во задач в категории с учетом добавленной задачи
          return this.dataHandler.getUncompletedCountInCategory(task.category).pipe(map(count => {
            return ({t: task, count}); // в итоге получаем массив с добавленной задачей и кол-вом задач для категории
          }));
        }
      )).subscribe(result => {

      const t = result.t as Task;

      // если указана категория - обновляем счетчик для соотв. категории
      if (t.category) {
        this.categoryMap.set(t.category, result.count);
      }

      this.updateTasksAndStat();

    });

  }



  // показывает задачи с применением всех текущий условий (категория, поиск, фильтры и пр.)
  private updateTasksAndStat(): void {

    this.updateTasks(); // обновить список задач

    // обновить переменные для статистики
    this.updateStat();

  }

  // обновить статистику
  private updateStat(): void {
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

  // показать-скрыть статистику
  public toggleStat(showStat: boolean): void {
    this.showStat = showStat;
  }







  // если закрыли меню любым способом - ставим значение false
  public onClosedMenu() {
    this.menuOpened = false;
  }

  // параметры меню
  public setMenuValues() {
    this.menuPosition = 'left'; // расположение слева
    this.menuOpened = true; // меню сразу будет открыто по-умолчанию
    this.menuMode = 'push'; // будет "толкать" основной контент, а не закрывать его
    this.showBackdrop = true; // показывать темный фон или нет (нужно больше для мобильной версии)

  }



  // показать-скрыть меню
  public toggleMenu() {
    this.menuOpened = !this.menuOpened;
  }

}
