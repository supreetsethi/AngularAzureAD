import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { AuthenticationResult, EventMessage, EventType, InteractionStatus } from '@azure/msal-browser';
import { from, Observable } from 'rxjs';
import { concatMap, filter, map } from 'rxjs/operators';
import { DialogComponent } from '../dialog/dialog.component';
import { ApiService } from '../services/api.service';
import { RefreshService } from '../services/refresh.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  loginDisplay = false;
  displayedColumns: string[] = ['ID', 'Product Name', 'Category', 'Freshness', 'Price', 'Date', 'Comment', 'Action'];
  dataSource: any = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('table') table!: MatTable<any>;

  length = 100;
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  tabs!: any;
  tabIndex: Tabs = Tabs.Fruits;

  constructor(private authService: MsalService,
    private msalBroadcastService: MsalBroadcastService,
    private api: ApiService,
    private dialog: MatDialog,
    private refreshService: RefreshService) { }

  ngOnInit(): void {
    this.refreshService.getMessage().subscribe((message: any) => {
        this.getProductList(message.text);
    });

    this.msalBroadcastService.msalSubject$
      .pipe(
        filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS),
      )
      .subscribe((result: EventMessage) => {
        console.log(result);
        const payload = result.payload as AuthenticationResult;
        this.authService.instance.setActiveAccount(payload.account);
      });

    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None)
      )
      .subscribe(() => {
        this.setLoginDisplay();
        //this.getClaims(this.authService.instance.getActiveAccount()?.idTokenClaims as Record<string, any>);
      })

    this.createTabs();
    // debugger
    // this.getProductList(this.tabs[0]);
  }
  pageEvent!: PageEvent;
  selection = new SelectionModel<any>(true, []);

  setPageSizeOptions(setPageSizeOptionsInput: string) {
    this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
  }

  getProductList(category: string) {
    this.api.getProduct().pipe(
      map((data: any) =>
        data.filter((data: any) => data.category == category)
      )
    ).subscribe((res) => {
      debugger
      this.dataSource = res;
      this.dataSource = this.dataSource.map(function (a: any) { return { 'ID': a.id, 'Product Name': a.productName, 'Category': a.category, 'Price': a.price, 'Date': a.date, 'Freshness': a.freshness, 'Comment': a.comment } });
      this.setTab(category);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.table.renderRows();
    }, (err) => {
      console.log(err);
    })
  }
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    // this.isAllSelected() ?
    //     this.selection.clear() :
    //     this.dataSource.data.forEach(row => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  setLoginDisplay() {
    this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
  }

  getClaims(claims: Record<string, any>) {
    if (claims) {
      Object.entries(claims).forEach((claim: [string, unknown], index: number) => {
        this.dataSource.push({ id: index, claim: claim[0], value: claim[1] });
      });
    }
  }

  tabClick(event: any) {
    this.getProductList(event.tab.textLabel)
  }

  applyFilter(filterValue: any) {
    this.dataSource.filter = filterValue.currentTarget.value.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openDialog(obj: any) {
    this.api.getProduct().pipe(
      map((data: any) => data.filter((data: any) => data.id == obj.ID))
    ).subscribe((res) => {

      const dialogRef = this.dialog.open(DialogComponent, {
        width: '30%',
        data: res.length > 0 ? res[0] : null,

      }).afterClosed().subscribe((val: string) => {
        if (val === 'update') {
          this.getProductList(obj.Category);
        }
      });
    }, (err) => {
      console.log(err);
    });
  }

  deleteProduct(Obj: any) {
    this.api.deleteProduct(Obj.ID).subscribe((res: any) => {
      alert('Product deleted successfully');
      this.getProductList(Obj.Category);
    }, (err) => { alert('Product delete failed') })
  }

  setTab(category: String) {
    switch (category) {
      case 'Fruits':
        this.tabIndex = Tabs.Fruits;
        break;
      case 'Dry Fruits':
        this.tabIndex = Tabs.DryFruits;
        break;
      case 'Vegetables':
        this.tabIndex = Tabs.Vegetables;
        break;
      default:
        break;
    }

  }

  createTabs() {
    this.api.getCategory()
      .subscribe((res: any) => {
        this.tabs = [...res]
        this.getProductList(this.tabs[0].category)
      }, (err) => {
        console.error(err);
      });
  }

}

enum Tabs {
  Fruits = 0,
  DryFruits = 1,
  Vegetables = 2
}