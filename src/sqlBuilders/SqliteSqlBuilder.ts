import type { ToSql, SelectData, InsertData } from "./SqlBuilder"
import type { TypeAdapter } from "../TypeAdapter"
import type { OrderByMode } from "../expressions/select"
import { AbstractSqlBuilder } from "./AbstractSqlBuilder"

export class SqliteSqlBuilder extends AbstractSqlBuilder {
    sqlite: true = true
    _isReservedKeyword(word: string): boolean {
        return word.toUpperCase() in reservedWords
    }
    _buildSelectOrderBy(query: SelectData, _params: any[]): string {
        const orderBy = query.__orderBy
        if (!orderBy) {
            return ''
        }
        let orderByColumns = ''
        for (const property in orderBy) {
            if (orderByColumns) {
                orderByColumns += ', '
            }
            const order = orderBy[property]
            if (order) {
                switch (order as OrderByMode) {
                    case 'asc':
                    case 'asc nulls first':
                        orderByColumns += this._escape(property) + ' asc'
                        break
                    case 'desc':
                    case 'desc nulls last':
                        orderByColumns += this._escape(property) + ' desc'
                        break
                    case 'asc nulls last':
                        orderByColumns += this._escape(property) + ' is null, ' + this._escape(property) + ' asc'
                        break
                    case 'desc nulls first':
                        orderByColumns += this._escape(property) + ' is not null, ' + this._escape(property) + ' desc'
                        break
                }
                orderByColumns += this._escape(property) + ' ' + order
            } else {
                orderByColumns += this._escape(property)
            }
        }
        if (!orderByColumns) {
            return ''
        }

        return ' order by ' + orderByColumns
    }
    _buildSelectLimitOffset(query: SelectData, params: any[]): string {
        let result = ''

        const limit = query.__limit
        if (limit !== null && limit !== undefined) {
            result += ' limit ' + this._appendValue(limit, params, 'int', undefined)
        }

        const offset = query.__offset
        if (offset !== null && offset !== undefined) {
            result += ' offset ' + this._appendValue(offset, params, 'int', undefined)
        }
        return result
    }
    _trueValue = '1'
    _falseValue = '0'
    _buildInsertOutput(_query: InsertData, _params: any[]): string {
        return ''
    }
    _buildInsertReturning(_query: InsertData, _params: any[]): string {
        return ''
    }
    _is(params: any[], valueSource: ToSql, value: any, columnType: string, typeAdapter: TypeAdapter | undefined): string {
        return this._appendSqlParenthesis(valueSource, params) + ' is ' + this._appendValueParenthesis(value, params, columnType, typeAdapter)
    }
    _isNot(params: any[], valueSource: ToSql, value: any, columnType: string, typeAdapter: TypeAdapter | undefined): string {
        return this._appendSqlParenthesis(valueSource, params) + ' is not ' + this._appendValueParenthesis(value, params, columnType, typeAdapter)
    }
    _currentDate(_params: any): string {
        return "date('now')"
    }
    _currentTime(_params: any): string {
        return "time('now')"
    }
    _currentTimestamp(_params: any): string {
        return "datetime('now')"
    }
    _valueWhenNull(params: any[], valueSource: ToSql, value: any, columnType: string, typeAdapter: TypeAdapter | undefined): string {
        return 'ifnull(' + this._appendSql(valueSource, params) + ', ' + this._appendValue(value, params, columnType, typeAdapter) + ')'
    }
    _divide(params: any[], valueSource: ToSql, value: any, columnType: string, typeAdapter: TypeAdapter | undefined): string {
        return 'cast(' + this._appendSql(valueSource, params) + ' as real) / cast(' + this._appendValue(value, params, columnType, typeAdapter) + ' as real)'
    }
    _asDouble(params: any[], valueSource: ToSql): string {
        return 'cast(' + this._appendSql(valueSource, params) + 'as real)'
    }
    _ln(params: any[], valueSource: ToSql): string {
        return 'log(' + this._appendSql(valueSource, params) + ')'
    }
    _log10(params: any[], valueSource: ToSql): string {
        return 'log10(' + this._appendSql(valueSource, params) + ')'
    }
    _cbrt(params: any[], valueSource: ToSql): string {
        return 'power(' + this._appendSql(valueSource, params) + ', 3)'
    }
    _minValue(params: any[], valueSource: ToSql, value: any, columnType: string, typeAdapter: TypeAdapter | undefined): string {
        return 'min(' + this._appendSql(valueSource, params) + ', ' + this._appendValue(value, params, columnType, typeAdapter) + ')'
    }
    _maxValue(params: any[], valueSource: ToSql, value: any, columnType: string, typeAdapter: TypeAdapter | undefined): string {
        return 'max(' + this._appendSql(valueSource, params) + ', ' + this._appendValue(value, params, columnType, typeAdapter) + ')'
    }
    _getDate(params: any[], valueSource: ToSql): string {
        return "cast(strftime('%d', " + this._appendSql(valueSource, params) + ") as integer)"
    }
    _getTime(params: any[], valueSource: ToSql): string {
        return "round((julianday(" + this._appendSql(valueSource, params) + ") - 2440587.5) * 86400000.0)"
    }
    _getFullYear(params: any[], valueSource: ToSql): string {
        return "cast(strftime('%Y', " + this._appendSql(valueSource, params) + ") as integer)"
    }
    _getMonth(params: any[], valueSource: ToSql): string {
        return "cast(strftime('%m', " + this._appendSql(valueSource, params) + ") as integer)"
    }
    _getDay(params: any[], valueSource: ToSql): string {
        return "cast(strftime('%w'," + this._appendSql(valueSource, params) + ") as integer)"
    }
    _getHours(params: any[], valueSource: ToSql): string {
        return "cast(strftime('%H', " + this._appendSql(valueSource, params) + ") as integer)"
    }
    _getMinutes(params: any[], valueSource: ToSql): string {
        return "cast(strftime('%M', " + this._appendSql(valueSource, params) + ") as integer)"
    }
    _getSeconds(params: any[], valueSource: ToSql): string {
        return "cast(strftime('%S', " + this._appendSql(valueSource, params) + ") as integer)"
    }
    _getMilliseconds(params: any[], valueSource: ToSql): string {
        return "(strftime('%f', " + this._appendSql(valueSource, params) + " * 1000)) % 1000"
    }
    _like(params: any[], valueSource: ToSql, value: any, columnType: string, typeAdapter: TypeAdapter | undefined): string {
        return this._appendSqlParenthesis(valueSource, params) + ' like ' + this._appendValue(value, params, columnType, typeAdapter) + " escape '\\'"
    }
    _notLike(params: any[], valueSource: ToSql, value: any, columnType: string, typeAdapter: TypeAdapter | undefined): string {
        return this._appendSqlParenthesis(valueSource, params) + ' not like ' + this._appendValue(value, params, columnType, typeAdapter) + " escape '\\'"
    }
    _likeInsensitive(params: any[], valueSource: ToSql, value: any, columnType: string, typeAdapter: TypeAdapter | undefined): string {
        return 'lower(' + this._appendSql(valueSource, params) + ') like lower(' + this._appendValue(value, params, columnType, typeAdapter) + ") escape '\\'"
    }
    _notLikeInsensitive(params: any[], valueSource: ToSql, value: any, columnType: string, typeAdapter: TypeAdapter | undefined): string {
        return 'lower(' + this._appendSql(valueSource, params) + ') not like lower(' + this._appendValue(value, params, columnType, typeAdapter) + ") escape '\\'"
    }
    _startWith(params: any[], valueSource: ToSql, value: any, columnType: string, typeAdapter: TypeAdapter | undefined): string {
        return this._appendSqlParenthesis(valueSource, params) + ' like (' + this._escapeLikeWildcard(params, value, columnType, typeAdapter) + " || '%') escape '\\'"
    }
    _notStartWith(params: any[], valueSource: ToSql, value: any, columnType: string, typeAdapter: TypeAdapter | undefined): string {
        return this._appendSqlParenthesis(valueSource, params) + ' not like (' + this._escapeLikeWildcard(params, value, columnType, typeAdapter) + " || '%') escape '\\'"
    }
    _endWith(params: any[], valueSource: ToSql, value: any, columnType: string, typeAdapter: TypeAdapter | undefined): string {
        return this._appendSqlParenthesis(valueSource, params) + " like ('%' || " + this._escapeLikeWildcard(params, value, columnType, typeAdapter) + ") escape '\\'"
    }
    _notEndWith(params: any[], valueSource: ToSql, value: any, columnType: string, typeAdapter: TypeAdapter | undefined): string {
        return this._appendSqlParenthesis(valueSource, params) + " like ('%' || " + this._escapeLikeWildcard(params, value, columnType, typeAdapter) + ") escape '\\'"
    }
    _startWithInsensitive(params: any[], valueSource: ToSql, value: any, columnType: string, typeAdapter: TypeAdapter | undefined): string {
        return 'lower(' + this._appendSql(valueSource, params) + ') like lower(' + this._escapeLikeWildcard(params, value, columnType, typeAdapter) + " || '%') escape '\\'"
    }
    _notStartWithInsensitive(params: any[], valueSource: ToSql, value: any, columnType: string, typeAdapter: TypeAdapter | undefined): string {
        return 'lower(' + this._appendSql(valueSource, params) + ') not like lower(' + this._escapeLikeWildcard(params, value, columnType, typeAdapter) + " || '%') escape '\\'"
    }
    _endWithInsensitive(params: any[], valueSource: ToSql, value: any, columnType: string, typeAdapter: TypeAdapter | undefined): string {
        return 'lower(' + this._appendSql(valueSource, params) + ") like lower('%' || " + this._escapeLikeWildcard(params, value, columnType, typeAdapter) + ") escape '\\'"
    }
    _notEndWithInsensitive(params: any[], valueSource: ToSql, value: any, columnType: string, typeAdapter: TypeAdapter | undefined): string {
        return 'lower(' + this._appendSql(valueSource, params) + ") not like lower('%' || " + this._escapeLikeWildcard(params, value, columnType, typeAdapter) + ") escape '\\'"
    }
    _contains(params: any[], valueSource: ToSql, value: any, columnType: string, typeAdapter: TypeAdapter | undefined): string {
        return this._appendSqlParenthesis(valueSource, params) + " like ('%' || " + this._escapeLikeWildcard(params, value, columnType, typeAdapter) + " || '%') escape '\\'"
    }
    _notContains(params: any[], valueSource: ToSql, value: any, columnType: string, typeAdapter: TypeAdapter | undefined): string {
        return this._appendSqlParenthesis(valueSource, params) + " not like ('%' || " + this._escapeLikeWildcard(params, value, columnType, typeAdapter) + " || '%') escape '\\'"
    }
    _containsInsensitive(params: any[], valueSource: ToSql, value: any, columnType: string, typeAdapter: TypeAdapter | undefined): string {
        return 'lower(' + this._appendSql(valueSource, params) + ") like lower('%' || " + this._escapeLikeWildcard(params, value, columnType, typeAdapter) + " || '%') escape '\\'"
    }
    _notContainsInsensitive(params: any[], valueSource: ToSql, value: any, columnType: string, typeAdapter: TypeAdapter | undefined): string {
        return 'lower(' + this._appendSql(valueSource, params) + ") like lower('%' || " + this._escapeLikeWildcard(params, value, columnType, typeAdapter) + " || '%') escape '\\'"
    }
    _stringConcat(params: any[], separator: string | undefined, value: any): string {
        if (separator === undefined || separator === null) {
            return 'group_concat(' + this._appendSql(value, params) + ')'
        } else if (separator === '') {
            return 'group_concat(' + this._appendSql(value, params) + ", '')"
        } else {
            return 'group_concat(' + this._appendSql(value, params) + ', ' + this._appendValue(separator, params, 'string', undefined) + ')'
        }
    }
    _stringConcatDistinct(params: any[], separator: string | undefined, value: any): string {
        if (separator === undefined || separator === null) {
            return 'group_concat(distinct ' + this._appendSql(value, params) + ')'
        } else if (separator === '') {
            return 'group_concat(distinct ' + this._appendSql(value, params) + ", '')"
        } else {
            return 'group_concat(distinct ' + this._appendSql(value, params) + ', ' + this._appendValue(separator, params, 'string', undefined) + ')'
        }
    }
}

// Source: https://www.sqlite.org/lang_keywords.html (version: 3.30.1)
const reservedWords: { [word: string]: boolean | undefined } = {
    ABORT: true,
    ACTION: true,
    ADD: true,
    AFTER: true,
    ALL: true,
    ALTER: true,
    ANALYZE: true,
    AND: true,
    AS: true,
    ASC: true,
    ATTACH: true,
    AUTOINCREMENT: true,
    BEFORE: true,
    BEGIN: true,
    BETWEEN: true,
    BY: true,
    CASCADE: true,
    CASE: true,
    CAST: true,
    CHECK: true,
    COLLATE: true,
    COLUMN: true,
    COMMIT: true,
    CONFLICT: true,
    CONSTRAINT: true,
    CREATE: true,
    CROSS: true,
    CURRENT: true,
    CURRENT_DATE: true,
    CURRENT_TIME: true,
    CURRENT_TIMESTAMP: true,
    DATABASE: true,
    DEFAULT: true,
    DEFERRABLE: true,
    DEFERRED: true,
    DELETE: true,
    DESC: true,
    DETACH: true,
    DISTINCT: true,
    DO: true,
    DROP: true,
    EACH: true,
    ELSE: true,
    END: true,
    ESCAPE: true,
    EXCEPT: true,
    EXCLUDE: true,
    EXCLUSIVE: true,
    EXISTS: true,
    EXPLAIN: true,
    FAIL: true,
    FILTER: true,
    FIRST: true,
    FOLLOWING: true,
    FOR: true,
    FOREIGN: true,
    FROM: true,
    FULL: true,
    GLOB: true,
    GROUP: true,
    GROUPS: true,
    HAVING: true,
    IF: true,
    IGNORE: true,
    IMMEDIATE: true,
    IN: true,
    INDEX: true,
    INDEXED: true,
    INITIALLY: true,
    INNER: true,
    INSERT: true,
    INSTEAD: true,
    INTERSECT: true,
    INTO: true,
    IS: true,
    ISNULL: true,
    JOIN: true,
    KEY: true,
    LAST: true,
    LEFT: true,
    LIKE: true,
    LIMIT: true,
    MATCH: true,
    NATURAL: true,
    NO: true,
    NOT: true,
    NOTHING: true,
    NOTNULL: true,
    NULL: true,
    NULLS: true,
    OF: true,
    OFFSET: true,
    ON: true,
    OR: true,
    ORDER: true,
    OTHERS: true,
    OUTER: true,
    OVER: true,
    PARTITION: true,
    PLAN: true,
    PRAGMA: true,
    PRECEDING: true,
    PRIMARY: true,
    QUERY: true,
    RAISE: true,
    RANGE: true,
    RECURSIVE: true,
    REFERENCES: true,
    REGEXP: true,
    REINDEX: true,
    RELEASE: true,
    RENAME: true,
    REPLACE: true,
    RESTRICT: true,
    RIGHT: true,
    ROLLBACK: true,
    ROW: true,
    ROWS: true,
    SAVEPOINT: true,
    SELECT: true,
    SET: true,
    TABLE: true,
    TEMP: true,
    TEMPORARY: true,
    THEN: true,
    TIES: true,
    TO: true,
    TRANSACTION: true,
    TRIGGER: true,
    UNBOUNDED: true,
    UNION: true,
    UNIQUE: true,
    UPDATE: true,
    USING: true,
    VACUUM: true,
    VALUES: true,
    VIEW: true,
    VIRTUAL: true,
    WHEN: true,
    WHERE: true,
    WINDOW: true,
    WITH: true,
    WITHOUT: true
}