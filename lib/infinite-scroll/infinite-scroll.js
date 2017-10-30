import {Input, Inject, Directive, ChangeDetectorRef, IterableDiffer, IterableDiffers, ViewContainerRef, TemplateRef, EmbeddedViewRef} from 'angular2/core';
import {isPresent, isBlank} from 'angular2/src/facade/lang';

// This utility function searches up in the DOM tree to find the next higher element that has an overflowY other than visible.
function findScrollableParent(element) {
  while (element != document.documentElement) {
    if (getComputedStyle(element).overflowY !== 'visible') {
      break;
    }
    element = element.parentElement;
  }

  return element;
}

// Checks if an element with scrollbars is fully scrolled to the bottom
function isScrolledBottom(element) {
  return element.scrollHeight - element.scrollTop === element.clientHeight
}

@Directive({
  selector: '[ngcInfiniteScroll]'
})
export default class InfiniteScroll {
  constructor(@Inject(ViewContainerRef) viewContainerRef,
              @Inject(TemplateRef) templateRef,
              @Inject(IterableDiffers) iterableDiffers,
              @Inject(ChangeDetectorRef) cdr) {
    // Using Object.assign we can easily add all constructor arguments to our instance
    Object.assign(this, {viewContainerRef, templateRef, iterableDiffers, cdr});
    // We put aside the first parent element that is scrollable on the Y axis
    this.scrollableElement = findScrollableParent(viewContainerRef.element.nativeElement.parentElement);
    // If our scrollable parent element generates a scroll event we call onScroll
    this.scrollableElement.addEventListener('scroll', () => this.onScroll());
    // How many items will be shown initially
    this.shownItemCount = 3;
    // How many items should be displayed additionally, when we scroll to the bottom
    this.increment = 3;
  }

  // This input will be set by the for of template syntax
  @Input('ngcInfiniteScrollOf')
  set infiniteScrollOfSetter(value) {
    this.infiniteScrollOf = value;
    // Create a new iterable differ for the iterable `value`, if the differ is not already present
    if (isBlank(this.differ) && isPresent(value)) {
      this.differ = this.iterableDiffers.find(value).create(this.cdr);
    }
  }

  // This method should be called on scroll events on the scrollable parent
  onScroll() {
    // If the scrollable parent is scrolled to the bottom, we will increase the count of displayed items
    if (isScrolledBottom(this.scrollableElement)) {
      this.shownItemCount += this.increment;
      // After incrementing the number of items displayed, we need to tell the change detection to revalidate
      this.cdr.markForCheck();
    }
  }

  // By implementing this lifecycle hook, we are taking responsibility to do our own change detection instead of the default algorithm
  ngDoCheck() {
    // Check first if we already got the differ set in `infiniteScrollOfSetter`
    if (isPresent(this.differ)) {
      // We are creating a new slice based on the displayed item count and then create a changes object containing the differences using the IterableDiffer
      const changes = this.differ.diff(this.infiniteScrollOf.slice(0, this.shownItemCount));
      if (isPresent(changes)) {
        // If we have any changes, we call our `applyChanges` method
        this.applyChanges(changes);
      }
      // Check again if we need to increase our displayed item count once more
      this.onScroll();
    }
  }

  // This method gets a changes object from the `IterableDiffer` and handles the necessary DOM updates
  applyChanges(changes) {
    // First we create a record list that contains all moved and removed change records
    const recordViewTuples = [];
    changes.forEachRemovedItem((removedRecord) => recordViewTuples.push({record: removedRecord})));
    changes.forEachMovedItem((movedRecord) => recordViewTuples.push({record: movedRecord}));

    // We can now bulk remove all moved and removed views and as a result we get all moved records only
    const insertTuples = this.bulkRemove(recordViewTuples);
    // In addition to all moved records we also add a record for all newly added records
    changes.forEachAddedItem((addedRecord) => insertTuples.push({record: addedRecord}));

    // Now we have stored all moved and added records within `insertTuples` which we use to do a bulk insert. As a result we get the list of the newly created views. On those views we're then creating a view local variable `$implicit` that will bind the list items to the variable name used within the for of template syntax.
    this.bulkInsert(insertTuples).forEach((tuple) =>
      tuple.view.setLocal('\$implicit', tuple.record.item));
  }

  // Method that will detach moved records from the view container. Removed records are also removed completely from the view container.
  bulkRemove(tuples) {
    tuples.sort((a, b) => a.record.previousIndex - b.record.previousIndex);
    // Reducing the change records so we can return only moved records
    return tuples.reduceRight((movedTuples, tuple) => {
      // If an index is present on the change record, it means that its of type "moved"
      if (isPresent(tuple.record.currentIndex)) {
        // For moved records we only detach the view from the view container and push it into the reduced record list
        tuple.view = this.viewContainerRef.detach(tuple.record.previousIndex);
        movedTuples.push(tuple);
      } else {
        // If we're dealing with a record of type "removed", we completely remove the view
        this.viewContainerRef.remove(tuple.record.previousIndex);
      }
      return movedTuples;
    }, []);
  }

  // This method is used to bulk insert moved and added records
  bulkInsert(tuples) {
    tuples.sort((a, b) => a.record.currentIndex - b.record.currentIndex);
    tuples.forEach((tuple) => {
      // If we already have a view present in our change record, we know that we're dealing with a moved view
      if (isPresent(tuple.view)) {
        // We're inserting back the detached view at the new position within the view container
        this.viewContainerRef.insert(tuple.view, tuple.record.currentIndex);
      } else {
        // We're dealing with a newly created view so we create a new embedded view on the view container and store it in the change record
        tuple.view =
          this.viewContainerRef.createEmbeddedView(this.templateRef, tuple.record.currentIndex);
      }
    });
    return tuples;
  }
}
