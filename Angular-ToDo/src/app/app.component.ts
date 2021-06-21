import {Component} from '@angular/core';
import {Task} from "./model/Task";
import {DataHandlerService} from "./service/data-handler.service";

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styles: []
})
export class AppComponent {
    title = 'Todo';
    tasks: Task[];

    constructor(
      private dataHandler: DataHandlerService, //фасад дляработы с данными
    ) {
    }

    ngOnInit(): void{
      this.dataHandler.getAllTasks().subscribe(tasks => this.tasks = tasks)
    }
}
