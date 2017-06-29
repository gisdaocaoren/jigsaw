import {
    NgModule, Component, ContentChildren, QueryList, Input, Output, EventEmitter,
    Optional, OnInit, forwardRef, AfterContentInit, ChangeDetectorRef, AfterViewInit, ViewChildren, Renderer2,
    ElementRef, OnDestroy
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms'
import {RdkInputModule} from '../input/input';
import {AbstractRDKComponent} from '../core';
import {CommonUtils} from '../../core/utils/common-utils';
import {InternalUtils} from '../../core/utils/internal-utils';
import {ArrayCollection} from "../../core/data/array-collection";
import {CallbackRemoval} from "../../core/data/component-data";

@Component({
    selector: 'rdk-tile-select',
    templateUrl: 'tile-select.html',
    styleUrls: ['tile-select.scss'],
    host: {
        // '[style.width]': 'width'
    }
})
export class RdkTileSelect extends AbstractRDKComponent implements OnInit, AfterViewInit, OnDestroy {
    private _contentInit: boolean = false;
    private _selectedItems: ArrayCollection<any> = new ArrayCollection();
    private _removeRefreshCallback: CallbackRemoval;

    constructor(private _render: Renderer2,
                private _elementRef: ElementRef) {
        super();

    }

    public set width(value: string) {
        this._width = CommonUtils.getCssValue(value);
        this._render.setStyle(this._elementRef.nativeElement, 'width', this._width);
    }

    public set height(value: string) {
        this._height = CommonUtils.getCssValue(value);
        this._render.setStyle(this._elementRef.nativeElement, 'height', this._height);
    }

    @Input()
    public get selectedItems(): ArrayCollection<any> {
        return this._selectedItems;
    }

    public set selectedItems(newValue: ArrayCollection<any>) {
        if (this._selectedItems === newValue || !(newValue instanceof ArrayCollection)) {
            return;
        }

        this._selectedItems = newValue;
        if (this._contentInit) {
            this._setOptionState();
        }

        if (this._removeRefreshCallback) {
            this._removeRefreshCallback()
        }
        this._removeRefreshCallback = newValue.onRefresh(() => {
            this._setOptionState();
        });
    }

    @Output() public selectedItemsChange = new EventEmitter<any[]>();

    //设置对象的标识
    @Input() public trackItemBy: string | string[];

    //显示在界面上的属性名
    @Input() public labelField: string = 'label';

    //判断是否支持多选
    @Input() public multipleSelect: boolean = true;

    @Input() public searchable: boolean = false;

    @Input() public data: ArrayCollection<object>;

    @Input() public tileOptionWidth: string;

    @Input() public tileOptionHeight: string;

    //获取映射的子组件
    @ViewChildren(forwardRef(() => RdkTileOption))
    private _options: QueryList<RdkTileOption>;


    //根据选中的option更新selectedItems
    public updateSelectItems(optionItem, selected): void {
        if (this.multipleSelect) { //多选
            if (selected) {
                this.selectedItems.push(optionItem);
            } else {
                this._selectedItems.forEach(selectedItem => {
                    if (CommonUtils.compareWithKeyProperty(selectedItem, optionItem, <string[]>this.trackItemBy)) {
                        this.selectedItems.splice(this.selectedItems.indexOf(selectedItem), 1);
                    }
                });
            }
        } else { //单选选中
            this._options.length && this._options.forEach((option: RdkTileOption) => {
                //去除其他option选中
                if (!CommonUtils.compareWithKeyProperty(option.optionItem, optionItem, <string[]>this.trackItemBy) && option.selected) {
                    option.selected = false;
                    this.selectedItems.splice(this.selectedItems.indexOf(option.optionItem), 1);
                }
            });
            //添加选中数据
            this.selectedItems.push(optionItem);
        }
        this.selectedItems.refresh();
        this.selectedItemsChange.emit(this.selectedItems);
    }

    //根据selectedItems设置选中的option
    private _setOptionState(): void {
        if (this.selectedItems instanceof ArrayCollection) {
            this._options.length && this._options.forEach((option) => {
                let _hasSelected = false;
                this._selectedItems.forEach((optionItem) => {
                    if (CommonUtils.compareWithKeyProperty(option.optionItem, optionItem, <string[]>this.trackItemBy)) {
                        _hasSelected = true;
                    }
                });
                option.selected = _hasSelected;
                option._cdref.detectChanges();
            });
        }
    }

    ngOnInit() {
        this.trackItemBy = InternalUtils.initTrackItemBy(<string>this.trackItemBy, this.labelField);
        setTimeout(() => {
            this._render.setStyle(this._elementRef.nativeElement, 'width', this._width);
            this._render.setStyle(this._elementRef.nativeElement, 'height', this._height);
            this._render.setStyle(this._elementRef.nativeElement, 'opacity', 1);
        }, 0);

    }

    ngAfterViewInit() {
        this._contentInit = true;
        this._setOptionState();
    }

    ngOnDestroy() {
        if (this._removeRefreshCallback) {
            this._removeRefreshCallback()
        }
    }
}

@Component({
    selector: 'rdk-tile-option',
    templateUrl: 'tile-option.html',
    styleUrls: ['tile-option.scss'],
    host: {
        '[style.width]': 'width',
        '[style.height]': 'height',
        '[style.line-height]': 'height'
    }
})
export class RdkTileOption extends AbstractRDKComponent implements OnInit {
    @Input() public optionItem: any; //option对象

    public _$optionLabel: string; //显示在页面上的值
    private _tileSelect: RdkTileSelect; //父组件

    public selected: boolean = false;//选中状态

    constructor(@Optional() tileSelect: RdkTileSelect, public _cdref: ChangeDetectorRef) {
        super();
        this._tileSelect = tileSelect;
    }

    //点击组件触发
    public _$onClick(): void {
        if (this._tileSelect.multipleSelect) { //多选
            this.selected = !this.selected;//切换组件选中状态
            this._tileSelect.updateSelectItems(this.optionItem, this.selected);
        } else { //单选
            if (this.selected) {
                return;
            } else {
                this.selected = true;
                this._tileSelect.updateSelectItems(this.optionItem, this.selected);
            }
        }

    }

    ngOnInit() {
        //初始化option显示值
        this._$optionLabel = this.optionItem[this._tileSelect.labelField];
    }

}

@NgModule({
    imports: [CommonModule, FormsModule, RdkInputModule],
    declarations: [RdkTileSelect, RdkTileOption],
    exports: [RdkTileSelect, RdkTileOption]
})
export class RdkTileSelectModule {

}




