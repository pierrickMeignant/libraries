import {Component, EventEmitter, Input, OnInit, Output, Renderer2, TemplateRef} from '@angular/core';
import {AccordionItem} from '../../models/accordion-item';
import {AccordionEvent} from '../../events/accordion-event';
import {BehaviorSubject, Observable} from 'rxjs';
import {toLimitObservable} from 'commonlibraries';

@Component({
  selector: 'accordion',
  templateUrl: './accordion.component.html',
  styleUrls: ['./accordion.component.css']
})
export class AccordionComponent implements OnInit {
  @Input()
  id?: string;
  @Input()
  items?: (AccordionItem | {header: string, body?: TemplateRef<any>, text?: string, isExpand?: boolean})[];
  @Input()
  body?: TemplateRef<any>;

  @Output()
  collapsing = new EventEmitter<AccordionEvent>();

  constructor(private renderer: Renderer2) { }

  ngOnInit(): void {
  }

  expandOrReduce(body: HTMLDivElement, contain: HTMLDivElement, header: HTMLButtonElement, index: number, item: AccordionItem): void {
    const isExpand = body.className.indexOf('show') === -1;
    this.reduceOrExpandAccordionItem(body, contain, header, isExpand).subscribe(() => {
      this.collapsing.next({
        id: this.id,
        isExpand,
        item,
        index,
        revert: () => this.reduceOrExpandAccordionItem(body, contain, header, !isExpand).toPromise().finally()
      });
    });
  }

  selectTemplateBody(body: TemplateRef<any> | undefined, bodyContain: TemplateRef<any>): TemplateRef<any> {
    if (body) {
      return body;
    }
    if (this.body) {
      return this.body;
    }
    return bodyContain
  }

  couldOpen(header: HTMLButtonElement, body: HTMLDivElement, contain: HTMLDivElement, item: AccordionItem): boolean {
    if (item.isExpand) {
      this.reduceOrExpandAccordionItem(body, contain, header, body.className.indexOf('show') === -1).toPromise().finally();
      item.isExpand = false;
    }
    return false;
  }

  private reduceOrExpandAccordionItem(body: HTMLDivElement, contain: HTMLDivElement, header: HTMLButtonElement, isExpand: boolean): Observable<void> {
    const heightContain = contain.clientHeight;
    let finish = new BehaviorSubject<void>(undefined);
    if (!isExpand){
      this.renderer.addClass(header, 'collapsed');
      this.renderer.addClass(body, 'collapsing');
      this.renderer.removeClass(body, 'show');
      this.renderer.removeClass(body, 'collapse');
      setTimeout(() => {
        this.renderer.removeClass(body, 'collapsing');
        this.renderer.addClass(body, 'collapse');
        finish.next();
      }, 0.35 * (heightContain + 1));
    } else {
      this.renderer.removeClass(header, 'collapsed');
      this.renderer.setStyle(body, 'height', contain.clientHeight);
      this.renderer.removeClass(body, 'collapse');
      this.renderer.addClass(body, 'collapsing');
      setTimeout(() => {
        this.renderer.removeStyle(body, 'height');
        this.renderer.removeClass(body, 'collapsing');
        this.renderer.addClass(body, 'collapse');
        this.renderer.addClass(body, 'show');
        finish.next();
      }, 0.35 * (heightContain + 1));
    }
    return toLimitObservable(() => finish);
  }
}
