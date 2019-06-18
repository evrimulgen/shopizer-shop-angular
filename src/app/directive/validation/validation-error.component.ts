import { Component, ComponentDecorator, Input } from '@angular/core';
import { Validator, ValidatorFn } from '@angular/forms';
import { NgControl } from '@angular/forms';
import 'reflect-metadata';

class ValidationTypeDecorator {
  constructor(public validatorType: Function) {
  }
}

export function ValidationComponent(args: any): ComponentDecorator {
  var opt: any = copyObject(args);
  if (opt.selector) {
    opt.selector = `err-${opt.selector}`
  }
  opt.template = `<div *ngIf="!isValid()" class="alert alert-danger">
                    {{message}}
                  </div>`;
  return Component(opt);
}
export function copyObject<T>(object: T): T {
  var objectCopy = <T>{};

  for (var key in object) {
    if (object.hasOwnProperty(key)) {
      objectCopy[key] = object[key];
    }
  }

  return objectCopy;
}
//validation type decorator
export function ValidationType(validatorType: Function) {
  return (target: Function) => {
    var annotations = Reflect.getMetadata('annotations', target) || [];
    annotations.push(new ValidationTypeDecorator(validatorType));
    Reflect.defineMetadata('annotations', annotations, target);
  }
}
export abstract class ValidationErrorComponent {

  @Input() message: string;

  _validator: Validator | ValidatorFn;

  constructor(private _control: NgControl,
    validators: Array<Validator | ValidatorFn>) {

    //get the validator type
    var target = this.constructor;
    var annotations = Reflect.getMetadata('annotations', target) || [];

    for (let annotation of annotations) {
      if (annotation instanceof ValidationTypeDecorator) {
        var type = annotation.validatorType;
        for (let validator of validators) {
          if (validator instanceof type) {
            this._validator = validator;
            break;
          }
        }
      }
    }
  }

  isValid(): Boolean {
    if (!this._validator) return true;
    if (this._control.pristine) return true;

    var result = ("validate" in this._validator)
      ? (<Validator>this._validator).validate(this._control.control) : (<ValidatorFn>this._validator)(this._control.control);
    return !result;
  }



}