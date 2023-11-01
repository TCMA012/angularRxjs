/*
Angular The Unexpected Armen Vardanyan
https://indepth.dev/posts/1281/angular-the-unexpected

FormControl.disable
triggers
valueChanges
Observable


The solution:
Just call enable/disable with an emitEvent argument set to false:

*/
this.control.disable({emitEvent: false});

