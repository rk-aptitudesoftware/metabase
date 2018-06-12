/* @flow */

import React, { Component } from "react";

import TableInteractiveSummary from "../components/TableInteractiveSummary.jsx";
import TableSimpleSummary from "../components/TableSimpleSummary.jsx";
import { t } from "c-3po";

//todo: remove
import * as DataGrid from "metabase/lib/data_grid";

import Query from "metabase/lib/query";
import { isMetric, isDimension } from "metabase/lib/schema_metadata";
import {
  getFriendlyName,
} from "metabase/visualizations/lib/utils";
import SummaryTableColumnsSetting, { settingsAreValid, getColumnsFromSettings} from "metabase/visualizations/components/settings/SummaryTableColumnsSetting.jsx";

import _ from "underscore";
import cx from "classnames";
import RetinaImage from "react-retina-image";
import { getIn } from "icepick";

import type { DatasetData } from "metabase/meta/types/Dataset";
import type { Card, VisualizationSettings } from "metabase/meta/types/Card";

import { GroupingManager } from "../lib/GroupingManager";
import StructuredQuery from "metabase-lib/lib/queries/StructuredQuery";

type Props = {
  card: Card,
  data: DatasetData,
  settings: VisualizationSettings,
  isDashboard: boolean,
  query: StructuredQuery,
};
type State = {
  data: ?DatasetData,
  query: any
};


const GRAND_TOTAL_SETTINGS = "summaryTable" + "." + "grandTotal";
export const COLUMNS_SETTINGS = "summaryTable"  + "." + "columns";


export default class SummaryTable extends Component {
  props: Props;
  state: State;

  static uiName = t`Summary Table`;
  static identifier = "summaryTable";
  static iconName = "table";

  static minSize = { width: 4, height: 3 };

  static isSensible(cols, rows) {
    return true;
  }

  static checkRenderable([{ data: { cols, rows } }]) {
    // scalar can always be rendered, nothing needed here
  }

  static settings = {
    [GRAND_TOTAL_SETTINGS]: {
      title: t`Grand total`,
      widget: "toggle",
      getHidden: ([{ card, data }]) => false,
      getDefault: ([{ card, data }]) => true,
        // data &&
        // data.cols.length === 3 &&
        // Query.isStructured(card.dataset_query) &&
        // data.cols.filter(isMetric).length === 1 &&
        // data.cols.filter(isDimension).length === 2,
    },
    [COLUMNS_SETTINGS]: {
      widget: SummaryTableColumnsSetting,
      getHidden: (x, y, z) => {console.log(z); return false;} ,
      isValid: ([{ card, data }]) =>
        settingsAreValid(card.visualization_settings[COLUMNS_SETTINGS], data),
      getDefault: ([{ data }, ...tmp]) => (
      //   {
      //
      //   columnNameToProps:cols.reduce(
      //     (o, col) => ({ ...o, [col.name]: {enabled: col.visibility_type !== "details-only"} }),
      //     {},
      //   )
      // }
        undefined
      ),
        // cols.map(col => ({
        //   name: col.name,
        //   //todo: ?details-only
        //   enabled: col.visibility_type !== "details-only",
        // })),
      getProps: ([props]) => ({
        // columnNames: props.data.cols.reduce(
        //   (o, col) => ({ ...o, [col.name]: getFriendlyName(col) }),
        //   {},
        // ),
        tmp : props
      }),},
  };

  constructor(props: Props) {
    super(props);
    console.log('555');
    console.log(props);
    this.state = {
      data: null,
      query: props.query
    };
  }

  componentWillMount() {
    this._updateData(this.props);
  }

  componentWillReceiveProps(newProps: Props) {
    // console.log(newProps);
    // TODO: remove use of deprecated "card" and "data" props
    if (
      newProps.data !== this.props.data ||
      !_.isEqual(newProps.settings, this.props.settings)
    ) {
      this._updateData(newProps);
    }
  }

  _updateData({
    data,
    settings,
  }: {
    data: DatasetData,
    settings: VisualizationSettings,
  }) {
 {

   console.log('props.rawSeries');
   console.log(this.props.rawSeries);
   // console.log(data);
   // console.log(settings);
      const { cols, rows, columns } = data;
      const columnIndexes = getColumnsFromSettings(settings[COLUMNS_SETTINGS])
      //todo:
        // .filter(f => f.enabled)
        .map(f => _.findIndex(cols, c => c.name === f))
        .filter(i => i >= 0 && i < cols.length);

      this.setState({
        data: {
          cols: columnIndexes.map(i => cols[i]),
          columns: columnIndexes.map(i => columns[i]),
          rows: rows.map(row => columnIndexes.map(i => row[i])),
        },
      });
    }
  }


  render() {
    const { card, isDashboard, settings } = this.props;
    const { data } = this.state;
    const sort = getIn(card, ["dataset_query", "query", "order_by"]) || null;
    const isColumnsDisabled = false;
    //todo:
      // (settings[COLUMNS_SETTINGS] || []).filter(f => f.enabled).length < 1;
    const TableComponent = isDashboard ? TableSimpleSummary : TableInteractiveSummary;

    if (!data) {
      return null;
    }

    const groupingIndexes = new Array((settings[COLUMNS_SETTINGS].groupsSources || []).length).keys();

    //todo: fix 30
    const groupingManager = new GroupingManager(30, [...groupingIndexes], data.rows);

    const dataUpdated = { ...data, rows: groupingManager.rowsOrdered };

    if (isColumnsDisabled) {
      return (
        <div
          className={cx(
            "flex-full px1 pb1 text-centered flex flex-column layout-centered",
            { "text-slate-light": isDashboard, "text-slate": !isDashboard },
          )}
        >
          <RetinaImage
            width={99}
            src="app/assets/img/hidden-field.png"
            forceOriginalDimensions={false}
            className="mb2"
          />
          <span className="h4 text-bold">Every field is hidden right now</span>
        </div>
      );
    } else {
      return (
        // $FlowFixMe
        <TableComponent
          {...this.props}
          data={dataUpdated}
          sort={sort}
          groupingManager={groupingManager}
        />
      );
    }
  }
}

/**
 * A modified version of TestPopover for Jest/Enzyme tests.
 * It always uses TableSimple which Enzyme is able to render correctly.
 * TableInteractive uses react-virtualized library which requires a real browser viewport.
 */
export const TestTable = (props: Props) => (
  <SummaryTable {...props} isDashboard={true} />
);
TestTable.uiName = SummaryTable.uiName;
TestTable.identifier = SummaryTable.identifier;
TestTable.iconName = SummaryTable.iconName;
TestTable.minSize = SummaryTable.minSize;
TestTable.settings = SummaryTable.settings;


