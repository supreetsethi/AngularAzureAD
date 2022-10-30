import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RefreshService } from '../services/refresh.service';
import { forkJoin } from 'rxjs';
@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {

  freshnessList: any
  productForm !: FormGroup
  actionBtn: string = "Save";
  categoryList!: any

  constructor(private formbuilder: FormBuilder,
    private api: ApiService,
    private dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public editData: any,
    private refreshService: RefreshService) { }

  ngOnInit(): void {
    this.productForm = this.formbuilder.group({
      productName: ['', Validators.required],
      category: ['', Validators.required],
      freshness: ['', Validators.required],
      price: ['', Validators.required],
      comment: ['', Validators.required],
      date: ['', Validators.required],
    });

    if (this.editData) {
      this.actionBtn = "Update";
      this.productForm.controls['productName'].setValue(this.editData.productName);
      this.productForm.controls['category'].setValue(this.editData.category);
      this.productForm.controls['freshness'].setValue(this.editData.freshness);
      this.productForm.controls['price'].setValue(this.editData.price);
      this.productForm.controls['comment'].setValue(this.editData.comment);
      this.productForm.controls['date'].setValue(this.editData.date);
    }

    this.initializeForm();

  }
  addproduct() {
    if (this.productForm.valid) {
      if (!this.editData) {
        this.api.postProduct(this.productForm.value)
          .subscribe({
            next: (res) => {
              alert("Product added successfully.")
              this.refreshService.sendMessage(this.productForm.controls['category'].value);
              this.productForm.reset();
              this.dialogRef.close('Saved');
            },
            error: () => {
              alert("Product save failed.")
            }
          })
      }
      else {
        this.api.putProduct(this.productForm.value, this.editData.id).subscribe({
          next: (res) => {
            alert('Update Successfully');
            this.refreshService.sendMessage(this.productForm.controls['category'].value);
            this.productForm.reset();
            this.dialogRef.close('Update');
          },
          error: () => {
            alert("Update failed.")
          }
        })
      }
    }
  }

  initializeForm() {
    forkJoin({
      category: this.api.getCategory(),
      freshness: this.api.getFreshness(),
    }).subscribe((res: any) => {
      this.categoryList = [...res.category]
      this.freshnessList = [...res.freshness]
    }, (err) => {
      console.error(err);
    });
  }
}
