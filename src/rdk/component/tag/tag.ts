import {Component, ElementRef, EventEmitter, Input, NgModule, OnInit, Output, Renderer2} from "@angular/core";
import {CommonModule} from "@angular/common";
import {AnimationDestroy} from "../animations/destroy";
import {AbstractRDKComponent} from "../core";

@Component({
    selector: 'rdk-tag',
    templateUrl: 'tag.html',
    styleUrls: ['tag.scss'],
    host: {
        '[style.width]': 'width',
        '[style.height]': 'height',
        '[style.line-height]': 'height',
        '[style.background]': 'color',
        '[style.border-color]': 'color',
        '[class.rdk-tag-close]': '_closable',
        '[class.rdk-tag-color]': '!!color',
        '[@AnimationDestroy]': '_state',
        '(@AnimationDestroy.done)': '_animationDone($event)',
    },
    animations: [
        AnimationDestroy
    ]
})
export class RdkTag extends AbstractRDKComponent implements OnInit {

    @Input() public color: string;

    private _closable: boolean;
    @Input()
    public get closable(): boolean {
        return this._closable;
    };

    public set closable(value: boolean) {
        this._closable = value === undefined ? true : value;
    }

    private _state: string;

    constructor(private _renderer: Renderer2,
                private _elementRef: ElementRef) {
        super();
    }

    @Output() public close = new EventEmitter<RdkTag>();

    public _$close(event) {
        event.preventDefault();
        event.stopPropagation();
        this._state = 'inactive';
    }

    @Output() public select = new EventEmitter<RdkTag>();

    public _$select(event) {
        event.preventDefault();
        event.stopPropagation();
        this.select.emit(this);
    }

    private _animationDone($event) {
        if ($event.toState === 'inactive') {
            this.close.emit(this);
            this._renderer.parentNode(this._elementRef.nativeElement).removeChild(this._elementRef.nativeElement);
        }
    }

    ngOnInit() {
        this.basicClass && this._renderer.addClass(this._elementRef.nativeElement, this.basicClass);
    }

}


@NgModule({
    imports: [CommonModule],
    declarations: [RdkTag],
    exports: [RdkTag]
})
export class RdkTagModule {

}
