import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FoodsListComponent, DialogOverviewExampleDialog, TransferDialog, SellDialog } from './foods-list/foods-list.component';
import { FoodBookingComponent } from './food-booking/food-booking.component';
import * as material from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import {UniversityService} from '../@core/university.service';

const routes: Routes = [
  { path: '', component: FoodsListComponent},

];
@NgModule({
  declarations: [FoodsListComponent, FoodBookingComponent, DialogOverviewExampleDialog, TransferDialog, SellDialog],
  imports: [
    CommonModule,
    material.MatCardModule,
    material.MatFormFieldModule,
    material.MatButtonModule,
    material.MatSelectModule,
    material.MatChipsModule,
    material.MatProgressBarModule,
    material.MatSliderModule,
    material.MatDialogModule,
    material.MatInputModule,
    material.MatIconModule,

    FormsModule, ReactiveFormsModule,
    RouterModule.forChild(routes)
  ],
  entryComponents : [ DialogOverviewExampleDialog, TransferDialog, SellDialog],
  providers : [UniversityService]
})
export class FoodsModule { }
