// IMPORTS
import { startOfWeek, subDays, startOfMonth, subMinutes, subHours, formatISO } from 'date-fns';
import { ConversationsData, ViewDefinitionType } from "../Constants/typing";

// Define UUID regex for matching UUIDs
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Relative time regex
const RELATIVE_TIME_REGEX = /^int_(\d+)_(minutes|hours|days)$/;

// Get dynamic timestamps
const getDynamicTimestamps = () => {
    const now = new Date();
    const startOfThisWeek = startOfWeek(now);
    const yesterday = subDays(now, 1);
    const startOfThisMonth = startOfMonth(now);

    return {
        start_of_week: startOfThisWeek,
        yesterday: yesterday,
        today: now,
        start_of_month: startOfThisMonth,
    };
};

// Parse relative time string into Date object
const parseRelativeTime = (value: string): Date | null => {
    const match = value.match(RELATIVE_TIME_REGEX);
    if (match) {
        const amount = parseInt(match[1], 10);
        const unit = match[2];
        let date = new Date();
        if (unit === 'minutes') {
            date = subMinutes(date, amount);
        } else if (unit === 'hours') {
            date = subHours(date, amount);
        } else if (unit === 'days') {
            date = subDays(date, amount);
        }
        return date;
    }
    return null;
};

// Evaluate individual condition
const checkCondition = (
    ticket: ConversationsData,
    condition: { col: string, op: string, val: any },
    userId: string
): boolean => {
    let ticketValue: any;
    let conditionValue: any = condition.val;

    // Handle dynamic timestamps
    const dynamicTimestamps = getDynamicTimestamps();

    // Normalize condition value
    if (conditionValue === 'me') {
        conditionValue = userId;
    } else if (conditionValue === 'today') {
        conditionValue = dynamicTimestamps.today;
    } else if (conditionValue === 'yesterday') {
        conditionValue = dynamicTimestamps.yesterday;
    } else if (conditionValue === 'start_of_week') {
        conditionValue = dynamicTimestamps.start_of_week;
    } else if (conditionValue === 'start_of_month') {
        conditionValue = dynamicTimestamps.start_of_month;
    } else if (typeof conditionValue === 'string') {
        const relativeDate = parseRelativeTime(conditionValue);
        if (relativeDate) {
            conditionValue = relativeDate;
        }
    } else if (Array.isArray(conditionValue)) {
        conditionValue = conditionValue.map(val => {
            if (val === 'me') {
                return userId;
            } else if (val === 'today') {
                return dynamicTimestamps.today;
            } else if (val === 'yesterday') {
                return dynamicTimestamps.yesterday;
            } else if (val === 'start_of_week') {
                return dynamicTimestamps.start_of_week;
            } else if (val === 'start_of_month') {
                return dynamicTimestamps.start_of_month;
            } else if (typeof val === 'string') {
                const relativeDate = parseRelativeTime(val);
                if (relativeDate) {
                    return relativeDate;
                }
            }
            return val;
        });
    }

    // Get ticketValue
    if (condition.col in ticket) {
        ticketValue = ticket[condition.col as keyof ConversationsData];
    } else if (ticket.cdas && condition.col in ticket.cdas) {
        ticketValue = ticket.cdas[condition.col];
    } else if (UUID_REGEX.test(condition.col)) {
        // Dynamic column
        if (condition.op === 'contains' || condition.op === 'ncontains') {
            // Handle tag
            if (ticket.tags && Array.isArray(ticket.tags)) {
                ticketValue = ticket.tags;
            } else {
                ticketValue = [];
            }
        } else {
            // Handle CDA field
            if (ticket.cdas && condition.col in ticket.cdas) {
                ticketValue = ticket.cdas[condition.col];
            } else {
                ticketValue = undefined;
            }
        }
    } else {
        ticketValue = undefined;
    }

    // Handle 'exists' operator
    if (condition.op === 'exists') {
        const exists = (ticketValue !== undefined && ticketValue !== null);
        if (conditionValue === true || conditionValue === 'true') {
            return exists;
        } else if (conditionValue === false || conditionValue === 'false') {
            return !exists;
        } else {
            return false;
        }
    }

    if (ticketValue === undefined) {
        return false;
    }

    // Normalize ticketValue and conditionValue for comparison
    if (!isNaN(Number(ticketValue)) && !isNaN(Number(conditionValue))) {
        ticketValue = Number(ticketValue);
        conditionValue = Number(conditionValue);
    } else if (typeof ticketValue === 'string' && typeof conditionValue === 'string') {
        // No need to parse
    } else if (ticketValue instanceof Date || conditionValue instanceof Date) {
        if (!(ticketValue instanceof Date)) {
            ticketValue = new Date(ticketValue);
        }
        if (!(conditionValue instanceof Date)) {
            conditionValue = new Date(conditionValue);
        }
    }

    // Operators
    switch (condition.op) {
        case "eq":
            return ticketValue === conditionValue;
        case "neq":
            return ticketValue !== conditionValue;
        case "gt":
            return ticketValue > conditionValue;
        case "lt":
            return ticketValue < conditionValue;
        case "geq":
            return ticketValue >= conditionValue;
        case "leq":
            return ticketValue <= conditionValue;
        case "in":
            if (Array.isArray(conditionValue)) {
                return conditionValue.includes(ticketValue);
            }
            return false;
        case "nin":
            if (Array.isArray(conditionValue)) {
                return !conditionValue.includes(ticketValue);
            }
            return false;
        case "contains":
            if (Array.isArray(ticketValue)) {
                return ticketValue.includes(conditionValue);
            } else if (typeof ticketValue === 'string' && typeof conditionValue === 'string') {
                return ticketValue.includes(conditionValue);
            }
            return false;
        case "ncontains":
            if (Array.isArray(ticketValue)) {
                return !ticketValue.includes(conditionValue);
            } else if (typeof ticketValue === 'string' && typeof conditionValue === 'string') {
                return !ticketValue.includes(conditionValue);
            }
            return false;
        case "starts_with":
            if (typeof ticketValue === 'string' && typeof conditionValue === 'string') {
                return ticketValue.startsWith(conditionValue);
            }
            return false;
        case "ends_with":
            if (typeof ticketValue === 'string' && typeof conditionValue === 'string') {
                return ticketValue.endsWith(conditionValue);
            }
            return false;
        case "between":
            if (Array.isArray(conditionValue) && conditionValue.length === 2) {
                let [start, end] = conditionValue;
                if (typeof start === 'string' && !isNaN(Date.parse(start))) {
                    start = new Date(start);
                }
                if (typeof end === 'string' && !isNaN(Date.parse(end))) {
                    end = new Date(end);
                }
                if (ticketValue instanceof Date && start instanceof Date && end instanceof Date) {
                    return ticketValue >= start && ticketValue <= end;
                } else if (typeof ticketValue === 'number' && typeof start === 'number' && typeof end === 'number') {
                    return ticketValue >= start && ticketValue <= end;
                } else if (typeof ticketValue === 'string' && typeof start === 'string' && typeof end === 'string') {
                    return ticketValue >= start && ticketValue <= end;
                } else {
                    return false;
                }
            }
            return false;
        default:
            return false;
    }
};

// Evaluate groups and logic
const evaluateGroups = (
    ticket: ConversationsData,
    filters: { logic: string, groups: Array<{ logic: string, conditions: Array<{ col: string, op: string, val: any }> }> },
    userId: string
): boolean => {
    const mainLogic = filters.logic.toUpperCase() === 'OR' ? 'OR' : 'AND';
    const groupResults = filters.groups.map((group) => {
        const groupLogic = group.logic.toUpperCase() === 'OR' ? 'OR' : 'AND';
        const conditionResults = group.conditions.map((condition) => checkCondition(ticket, condition, userId));

        if (groupLogic === 'AND') {
            return conditionResults.every(Boolean);
        } else {
            return conditionResults.some(Boolean);
        }
    });

    if (mainLogic === 'AND') {
        return groupResults.every(Boolean);
    } else {
        return groupResults.some(Boolean);
    }
};

// Main function
const DetermineConversationViews = (
    ticketData: ConversationsData | null | undefined,
    views: ViewDefinitionType[],
    userId: string
): string[] => {
    if (!ticketData) return [];

    const results: string[] = [];
    views.forEach((view) => {
        const filters = view.filters;
        if (!filters || !filters.groups) return;

        const matchesView = evaluateGroups(ticketData, filters, userId);
        if (matchesView) {
            results.push(view.uuid);
        }
    });

    return results
}

export default DetermineConversationViews;