import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MsalBroadcastService, MsalGuardConfiguration, MsalService, MSAL_GUARD_CONFIG } from '@azure/msal-angular';
import { InteractionStatus, RedirectRequest } from '@azure/msal-browser';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AzureAdDemoService } from 'src/services/msaluser.service';
import { DialogComponent } from './dialog/dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  isUserLoggedIn: boolean = false;
  userName?: string = '';
  private readonly _destroy = new Subject<void>();
  constructor(
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private msalBroadCastService: MsalBroadcastService,
    private authService: MsalService,
    private azureAdDemoSerice: AzureAdDemoService,
    private dialog: MatDialog) {

  }
  ngOnInit(): void {
    this.msalBroadCastService.inProgress$.pipe
      (filter((interactionStatus: InteractionStatus) =>
        interactionStatus == InteractionStatus.None),
        takeUntil(this._destroy))
      .subscribe(x => {
        this.isUserLoggedIn = this.authService.instance.getAllAccounts().length > 0;

        if (this.isUserLoggedIn) {
          this.userName = this.authService.instance.getAllAccounts()[0].name;
        }
        this.azureAdDemoSerice.isUserLoggedIn.next(this.isUserLoggedIn);
      })
  }
  ngOnDestroy(): void {
    this._destroy.next(undefined);
    this._destroy.complete();
  }
  login() {
    if (this.msalGuardConfig.authRequest) {
      this.authService.loginRedirect({ ...this.msalGuardConfig.authRequest } as RedirectRequest)
    }
    else {
      this.authService.loginRedirect();
    }
  }
  logout() {
    this.authService.logoutRedirect({ postLogoutRedirectUri: environment.postLogoutUrl });
  }

  openDialog() {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '30%'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
}