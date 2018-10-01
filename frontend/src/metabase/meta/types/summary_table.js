/* @flow */

import type { ColumnName, DatasetData } from "metabase/meta/types/Dataset";
import type { ColumnMetadata } from "metabase/visualizations/components/settings/ChartSettingsSummaryTableColumns";
import { Set } from "immutable";

export type Groups = Set<ColumnName>;
export type Aggregations = Set<ColumnName>;
export type AggregationKey = [Groups, Aggregations];

export type SummaryTableSettings = {
  groupsSources: string[],
  columnsSource: string[],
  valuesSources: string[],
  unusedColumns: string[],
  columnNameToMetadata: { [key: ColumnName]: ColumnMetadata },
};

export type ResultProvider = AggregationKey => DatasetData;

export type QueryPlan = {
  groupings: Groups[][],
  aggregations: Aggregations,
};
