import {describe, expect, it, inject, injectAsync, TestComponentBuilder} from 'angular2/testing';
import AutoComplete from './auto-complete.js';
import {By} from 'angular2/platform/common_dom';
import {Component, Input} from 'angular2/core';
import Editor from '../editor/editor.js';

@Component({
  selector: 'ngc-editor',
  template: '{{content}}'
})
export class MockEditor {
  @Input() content;
}

describe('AutoComplete', () => {
  it('should filter items correctly', () => {
    // Given
    const autoComplete = new AutoComplete();
    autoComplete.items = ['One', 'two', 'three'];

    // When
    autoComplete.filterItems('o');

    // Then
    expect(autoComplete.filteredItems).toEqual(['One', 'two']);
  });

  it('should emit selectedItemChange event with null on empty content being saved', () => {
    // Given
    const autoComplete = new AutoComplete();
    autoComplete.items = ['one', 'two', 'three'];
    autoComplete.selectedItem = 'three';
    spyOn(autoComplete.selectedItemChange, 'next');
    spyOn(autoComplete.itemCreated, 'next');

    // When
    autoComplete.onEditSaved('');

    // Then
    expect(autoComplete.selectedItemChange.next).toHaveBeenCalledWith(null);
    expect(autoComplete.itemCreated.next).not.toHaveBeenCalled();
  });

  it('should emit an itemCreated event on content being saved which does not match an existing item', () => {
    // Given
    const autoComplete = new AutoComplete();
    autoComplete.items = ['one', 'two', 'three'];
    autoComplete.selectedItem = 'three';
    spyOn(autoComplete.selectedItemChange, 'next');
    spyOn(autoComplete.itemCreated, 'next');

    // When
    autoComplete.onEditSaved('four');

    // Then
    expect(autoComplete.selectedItemChange.next).not.toHaveBeenCalled();
    expect(autoComplete.itemCreated.next).toHaveBeenCalledWith('four');
  });

  it('should initialize editor with selected item', injectAsync([TestComponentBuilder], (tcb) => {
    return tcb
      .overrideDirective(AutoComplete, Editor, MockEditor)
      .createAsync(AutoComplete).then((fixture) => {
        // Given
        fixture.componentInstance.items = ['one', 'two', 'three'];
        fixture.componentInstance.selectedItem = 'two';

        // When
        fixture.detectChanges();

        // Then
        expect(fixture.debugElement.query(By.directive(MockEditor)).nativeElement.textContent.trim()).toBe('two');
      });
  }));

  it('should emit selectedItemChange on click in callout', injectAsync([TestComponentBuilder], (tcb) => {
    return tcb
      .overrideDirective(AutoComplete, Editor, MockEditor)
      .createAsync(AutoComplete).then((fixture) => {
        // Given
        spyOn(fixture.componentInstance.selectedItemChange, 'next');
        fixture.componentInstance.items = ['one', 'two', 'three'];
        fixture.componentInstance.selectedItem = 'one';
        fixture.componentInstance.onEditModeChange(true);
        fixture.componentInstance.onEditableInput('');

        // When
        fixture.detectChanges();
        fixture.debugElement
          .queryAll(By.css('.auto-complete__item'))
          .find((item) => item.nativeElement.textContent.trim() === 'two')
          .triggerEventHandler('click');

        // Then
        expect(fixture.componentInstance.selectedItemChange.next).toHaveBeenCalledWith('two');
      });
  }));

  it('should show create button in callout and emit itemCreated event when clicked', injectAsync([TestComponentBuilder], (tcb) => {
    return tcb
      .overrideDirective(AutoComplete, Editor, MockEditor)
      .createAsync(AutoComplete).then((fixture) => {
        // Given
        spyOn(fixture.componentInstance.itemCreated, 'next');
        fixture.componentInstance.items = ['one', 'two', 'three'];
        fixture.componentInstance.selectedItem = 'one';
        fixture.componentInstance.onEditModeChange(true);
        fixture.componentInstance.onEditableInput('four');

        // When
        fixture.detectChanges();
        const createElement = fixture.debugElement
          .query(By.css('.auto-complete__item--create'));
        createElement.triggerEventHandler('click');

        // Then
        expect(createElement.nativeElement.textContent.trim()).toBe('Create "four"');
        expect(fixture.componentInstance.itemCreated.next).toHaveBeenCalledWith('four');
      });
  }));
});
