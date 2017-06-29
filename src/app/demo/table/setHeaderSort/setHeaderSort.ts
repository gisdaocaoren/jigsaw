import {Component} from "@angular/core";
import {TableData} from "../../../../rdk/core/data/table-data";
import {ColumnDefine} from "../../../../rdk/component/table/table-api";
import {SortAs, SortOrder} from "../../../../rdk/core/data/component-data";
import {Http} from "@angular/http";



@Component({
  templateUrl: 'setHeaderSort.html'
})
export class TableSetHeaderSortDemoComponent {
    tableData: TableData;

    constructor(http: Http) {
        this.tableData = new TableData();
        this.tableData.http = http;
        this.tableData.fromAjax('mock-data/table/data.json');
    }



     _columns: ColumnDefine[] = [
        {
            target: 'salary',
            header: {
                sortable:true,
                sortAs: SortAs.number,
                defaultSortOrder: SortOrder.asc,
            }
        },{
            target: 'name',
            header: {
                sortable:true,
                sortAs: SortAs.string,
                defaultSortOrder: SortOrder.des,
            }
        }];
}



