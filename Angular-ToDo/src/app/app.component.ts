import {Component} from '@angular/core';
import {Task} from "./model/Task";
import {DataHandlerService} from "./service/data-handler.service";
import {Category} from "./model/Category";

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styles: []
})
export class AppComponent {
    title = 'Todo';
    tasks: Task[];
    categories: Category[]
    constructor(
      private dataHandler: DataHandlerService, //фасад дляработы с данными
    ) {
    }

    ngOnInit(): void{
      this.dataHandler.getAllTasks().subscribe(tasks => this.tasks = tasks)
      this.dataHandler.getAllCategories().subscribe(categories => this.categories = categories)
    }
}
