import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeliverComponent, BuyDialog } from './deliver/deliver.component';
import * as material from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { FillPipe } from '../@core/fill.pipe';
import {UniversityService} from '../@core/university.service';

const routes: Routes = [
  { path: '', component: DeliverComponent},

];
@NgModule({
  declarations: [DeliverComponent, FillPipe, BuyDialog],
  imports: [
    CommonModule,
    FormsModule, ReactiveFormsModule,
    material.MatCardModule,
    material.MatFormFieldModule,
    material.MatButtonModule,
    material.MatSelectModule,
    material.MatInputModule,
    material.MatSlideToggleModule,
    material.MatListModule,
    material.MatDialogModule,
    RouterModule.forChild(routes),
  ],
  providers : [UniversityService],
  entryComponents : [ BuyDialog ],

})
export class DeliverModule { }
