import type { ColumnsOf, InputTypeOfColumn, ValueSource, TypeOfColumn, IExecutableSelect } from "./values"
import type { ITableOrView, NoTableOrViewRequiredView } from "../utils/ITableOrView"
import type { AnyDB, TypeSafeDB, NoopDB, PostgreSql, SqlServer, Oracle } from "../databases"
import type { int } from "ts-extended-types"
import type { database, tableOrView, tableOrViewRef } from "../utils/symbols"
import type { ColumnWithDefaultValue, OptionalColumn, PrimaryKeyAutogeneratedColumn } from "../utils/Column"

export interface InsertExpressionOf<DB extends AnyDB> {
    [database]: DB
}

export interface InsertExpressionBase<TABLE extends ITableOrView<any>> extends InsertExpressionOf<TABLE[typeof database]> {
    [tableOrView]: TABLE
}

export interface ExecutableInsertReturning<TABLE extends ITableOrView<any>, RESULT> extends InsertExpressionBase<TABLE> {
    executeInsert(): Promise<RESULT>
    query(): string
    params(): any[]
}

export interface ExecutableInsertFromSelect<TABLE extends ITableOrView<any>> extends InsertExpressionBase<TABLE> {
    executeInsert(this: InsertExpressionOf<TypeSafeDB>): Promise<int>
    executeInsert(): Promise<number>
    query(): string
    params(): any[]
}

export interface ExecutableInsert<TABLE extends ITableOrView<any>> extends InsertExpressionBase<TABLE> {
    executeInsert(this: InsertExpressionOf<TypeSafeDB>): Promise<int>
    executeInsert(): Promise<number>
    query(): string
    params(): any[]
    returningLastInsertedId: ReturningLastInsertedIdType<TABLE>
    // returning(this: ExecutableInsert<NoopDB, any>): boolean
    // returning(this: ExecutableInsert<PostgreSql, any>): boolean
    // returning(this: NotSupportedDB): boolean
}

export interface ExecutableMultipleInsert<TABLE extends ITableOrView<any>> extends InsertExpressionBase<TABLE> {
    executeInsert(this: InsertExpressionOf<TypeSafeDB>): Promise<int>
    executeInsert(): Promise<number>
    query(): string
    params(): any[]
    returningLastInsertedId: ReturningMultipleLastInsertedIdType<TABLE>
}

export interface ExecutableInsertExpression<TABLE extends ITableOrView<any>> extends ExecutableInsert<TABLE> {
    set(columns: InsertSets<TABLE>): ExecutableInsertExpression<TABLE>
    setIfValue(columns: OptionalInsertSets<TABLE>): ExecutableInsertExpression<TABLE>
    setIfSet(columns: InsertSets<TABLE>): ExecutableInsertExpression<TABLE>
    setIfSetIfValue(columns: OptionalInsertSets<TABLE>): ExecutableInsertExpression<TABLE>
    setIfNotSet(columns: InsertSets<TABLE>): ExecutableInsertExpression<TABLE>
    setIfNotSetIfValue(columns: OptionalInsertSets<TABLE>): ExecutableInsertExpression<TABLE>
    ignoreIfSet(...columns: OptionalColumnsForInsertOf<TABLE>[]): ExecutableInsertExpression<TABLE>
}

export interface MissingKeysInsertExpression<TABLE extends ITableOrView<any>, MISSING_KEYS> extends InsertExpressionBase<TABLE> {
    set<COLUMNS extends InsertSets<TABLE>>(columns: COLUMNS): MaybeExecutableInsertExpression<TABLE, Exclude<MISSING_KEYS, keyof COLUMNS>>
    setIfValue<COLUMNS extends OptionalInsertSets<TABLE>>(columns: COLUMNS): MaybeExecutableInsertExpression<TABLE, Exclude<MISSING_KEYS, keyof COLUMNS>>
    setIfSet<COLUMNS extends InsertSets<TABLE>>(columns: COLUMNS): MaybeExecutableInsertExpression<TABLE, Exclude<MISSING_KEYS, keyof COLUMNS>>
    setIfSetIfValue<COLUMNS extends OptionalInsertSets<TABLE>>(columns: COLUMNS): MaybeExecutableInsertExpression<TABLE, Exclude<MISSING_KEYS, keyof COLUMNS>>
    setIfNotSet<COLUMNS extends InsertSets<TABLE>>(columns: COLUMNS): MaybeExecutableInsertExpression<TABLE, Exclude<MISSING_KEYS, keyof COLUMNS>>
    setIfNotSetIfValue<COLUMNS extends OptionalInsertSets<TABLE>>(columns: COLUMNS): MaybeExecutableInsertExpression<TABLE, Exclude<MISSING_KEYS, keyof COLUMNS>>
    ignoreIfSet(...columns: OptionalColumnsForInsertOf<TABLE>[]): MissingKeysInsertExpression<TABLE, MISSING_KEYS>
}

export interface InsertExpression<TABLE extends ITableOrView<any>> extends InsertExpressionBase<TABLE> {
    dynamicSet(): MissingKeysInsertExpression<TABLE, keyof RequiredInsertSets<TABLE>>
    set(columns: InsertSets<TABLE> & RequiredInsertSets<TABLE>): ExecutableInsertExpression<TABLE>
    setIfValue(columns: OptionalInsertSets<TABLE> & RequiredInsertSets<TABLE>): ExecutableInsertExpression<TABLE>
    values(columns: InsertSets<TABLE> & RequiredInsertSets<TABLE>): ExecutableInsertExpression<TABLE>
    values(columns: Array<InsertSets<TABLE> & RequiredInsertSets<TABLE>>): ExecutableMultipleInsert<TABLE>
    defaultValues: DefaultValueType<TABLE>
    from(select: IExecutableSelect<TABLE[typeof database], SelectForInsertResultType<TABLE>, NoTableOrViewRequiredView<TABLE[typeof database]>>): ExecutableInsertFromSelect<TABLE>
}

type ReturningMultipleLastInsertedIdType<TABLE extends ITableOrView<any>> =
    TABLE[typeof database] extends (NoopDB | PostgreSql | SqlServer | Oracle) 
    ? AutogeneratedPrimaryKeyColumnsTypesOf<TABLE> extends never ? never : () => ExecutableInsertReturning<TABLE, AutogeneratedPrimaryKeyColumnsTypesOf<TABLE>[]>
    : never

type ReturningLastInsertedIdType<TABLE extends ITableOrView<any>> =
    AutogeneratedPrimaryKeyColumnsTypesOf<TABLE> extends never ? never : () => ExecutableInsertReturning<TABLE, AutogeneratedPrimaryKeyColumnsTypesOf<TABLE>>

type DefaultValueType<TABLE extends ITableOrView<any>> =
    'yes' extends MissingKeys<keyof RequiredInsertSets<TABLE>> ? never : () => ExecutableInsert<TABLE>

type MissingKeys<KEYS> = KEYS extends never ? never : 'yes'
type MaybeExecutableInsertExpression<TABLE extends ITableOrView<any>, MISSING_KEYS> = 
    'yes' extends MissingKeys<MISSING_KEYS> ? MissingKeysInsertExpression<TABLE, MISSING_KEYS> : ExecutableInsertExpression<TABLE>

export type SelectForInsertResultType<TABLE extends ITableOrView<any>> = {
    [P in ColumnsOf<TABLE>]?: TypeOfColumn<TABLE, P>
} & {
    [P in RequiredColumnsForInsertOf<TABLE>]: TypeOfColumn<TABLE, P>
}

export type InsertSets<TABLE extends ITableOrView<any>> = {
    [P in ColumnsOf<TABLE>]?: InputTypeOfColumn<TABLE, P>
}

export type OptionalInsertSets<TABLE extends ITableOrView<any>> = {
    [P in ColumnsOf<TABLE>]?: InputTypeOfColumn<TABLE, P> | null | undefined
}

export type RequiredInsertSets<TABLE extends ITableOrView<any>> = {
    [P in RequiredColumnsForInsertOf<TABLE>]: InputTypeOfColumn<TABLE, P>
}

export type RequiredColumnsForInsertOf<T extends ITableOrView<any>> = (
    { [K in keyof T]-?: T[K] extends ValueSource<T[typeof tableOrViewRef], any> ? (T[K] extends OptionalColumn ? never : (T[K] extends ColumnWithDefaultValue ? never : K)) : never }
)[keyof T]

export type OptionalColumnsForInsertOf<T extends ITableOrView<any>> = (
    { [K in keyof T]-?: T[K] extends ValueSource<T[typeof tableOrViewRef], any> ? (T[K] extends OptionalColumn ? K : (T[K] extends ColumnWithDefaultValue ? K : never)) : never }
)[keyof T]

export type AutogeneratedPrimaryKeyColumnsTypesOf<T extends ITableOrView<any>> = (
    { [K in keyof T]-?: T[K] extends ValueSource<T[typeof tableOrViewRef], infer TYPE> ? (T[K] extends PrimaryKeyAutogeneratedColumn ? TYPE : never) : never }
)[keyof T]
