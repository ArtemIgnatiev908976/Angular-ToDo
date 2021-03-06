import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {SettingsDialogComponent} from "../../dialog/settings-dialog/settings-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {IntroService} from "../../service/intro.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})


export class HeaderComponent implements OnInit {

  @Input()
  categoryName: string;

  @Input()
  public showStat: boolean;

  @Output()
  toggleStat = new EventEmitter<boolean>(); // показать/скрыть статистику


  constructor(
    private dialog: MatDialog,
    private introService: IntroService
  ) {
  }

  ngOnInit() {
  }

  public onToggleStat() {
    this.toggleStat.emit(!this.showStat); // вкл/выкл статистику
  }

  // окно настроек
  public showSettings() {
    const dialogRef = this.dialog.open(SettingsDialogComponent,
      {
        autoFocus: false,
        width: '500px'
      });

    // никаких действий не требуется после закрытия окна

  }

  public showIntroHelp(){
    this.introService.startIntroJS(false)
  }
}
