import {PriorityDAO} from '../interface/PriorityDAO';
import {Priority} from '../../../model/Priority';
import {TestData} from '../../TestData';
import {Observable, of} from 'rxjs';


// реализация работы с приоритетами в виде массивов
// все методы DAO возвращают тип Observable, для реактивных возможностей
// для работы с БД - нужно изменить реализацию каждого метода, чтобы обращался не к массивам, а делал RESTful запрос или напрямую к БД
export class PriorityDAOArray implements PriorityDAO {
  static priorities = TestData.priorities;// тестовые данные




  get(id: number): Observable<Priority> {

    return of(PriorityDAOArray.priorities.find(priority => priority.id === id));
  }

  getAll(): Observable<Priority[]> {

    return of(PriorityDAOArray.priorities);
  }

  add(priority: Priority): Observable<Priority> {


    // если id пустой - генерируем его
    if (priority.id === null || priority.id === 0) {
      priority.id = this.getLastIdPriority();
    }
    PriorityDAOArray.priorities.push(priority);

    return of(priority);
  }

  delete(id: number): Observable<Priority> {

    // перед удалением - нужно в задачах занулить все ссылки на удаленное значение
    // в реальной БД сама обновляет все ссылки (cascade update) - здесь нам приходится делать это вручную (т.к. вместо БД - массив)
    TestData.tasks.forEach(task => {
      if (task.priority && task.priority.id === id) {
        task.priority = null;
      }
    });

    const tmpPriority = PriorityDAOArray.priorities.find(t => t.id === id); // удаляем по id
    PriorityDAOArray.priorities.splice(PriorityDAOArray.priorities.indexOf(tmpPriority), 1);

    return of(tmpPriority);
  }

  update(priority: Priority): Observable<Priority> {

    const tmp = PriorityDAOArray.priorities.find(t => t.id === priority.id); // обновляем по id
    PriorityDAOArray.priorities.splice(PriorityDAOArray.priorities.indexOf(tmp), 1, priority);

    return of(priority);
  }

  // нужно только для реализации данных из массивов (т.к. в БД id создается автоматически)
  // генерирует id для нового значения
  public getLastIdPriority(): number {
    return Math.max.apply(Math, PriorityDAOArray.priorities.map(c => c.id)) + 1;
  }


}
