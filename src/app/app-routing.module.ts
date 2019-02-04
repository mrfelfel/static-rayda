import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AuthGuard} from './@core/auth.guard';
/*
 routing
*/
const routes: Routes = [
  { path : 'users', loadChildren  : './users/users.module#UsersModule'},
  { path : 'foods', loadChildren  : './foods/foods.module#FoodsModule', canActivate : [AuthGuard]},
  { path : 'deliver', loadChildren  : './deliver/deliver.module#DeliverModule', canActivate : [AuthGuard]},
  { path : 'errors', loadChildren  : './errors/errors.module#ErrorsModule'},
  { path : 'financial', loadChildren  : './financial/financial.module#FinancialModule'},
  { path: '', redirectTo: '/pages/home', pathMatch: 'full' },
  { path: 'pages', loadChildren: './pages/pages.module#PagesModule', canActivate : [AuthGuard]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
