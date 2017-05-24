import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from "@angular/forms";
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';

import { MainComponent } from './main/main.component';

@NgModule({
    imports: [BrowserModule, HttpModule, ReactiveFormsModule],
    declarations: [AppComponent, MainComponent],
    bootstrap: [AppComponent]
})

export class AppModule { }