//DATES
import { startOfWeek, subDays, startOfMonth, formatISO } from 'date-fns'
//TYPING
import { ConversationsData, View, Views } from "../Constants/typing"
 
//TYPING
interface ViewResult {
    view_type: 'private' | 'shared'
    view_index: number
}

//GET THE TIMESTAMP OF THE DYNAMYC VALUES
const getDynamicTimestamps = () => {
    const now = new Date()
    const startOfThisWeek = startOfWeek(now, { weekStartsOn: 1 })
    const yesterday = subDays(now, 1)
    const startOfThisMonth = startOfMonth(now)

    return {
        start_of_week: formatISO(startOfThisWeek),
        yesterday: formatISO(yesterday),
        today: formatISO(now),
        start_of_month: formatISO(startOfThisMonth)
    }
}


//CHECK IF A VIEW PASS A GIVEN CONDITION
const checkConditions = (ticket: ConversationsData, conditions: Array<{ column: string, operation_type: string, value: string | number }>, userId:string): boolean => {
    return conditions.every(condition => {
        
        let ticketValue: any;

    
        if (condition.column in ticket) ticketValue = ticket[condition.column as keyof ConversationsData]
        else if (ticket.custom_attributes && condition.column in ticket.custom_attributes && ticket.custom_attributes[condition.column]) ticketValue = ticket.custom_attributes[condition.column]
        else return false
        
        let normalizedTicketValue = ticketValue
        let normalizedConditionValue = condition.value

        if (!isNaN(Number(ticketValue)) && !isNaN(Number(condition.value))) {
            normalizedTicketValue = Number(ticketValue)
            normalizedConditionValue = Number(condition.value)
        }

        if (normalizedConditionValue === '{user_id}') normalizedConditionValue = userId
        else if (normalizedConditionValue === '{start_of_week}')  getDynamicTimestamps().start_of_week
        else if (normalizedConditionValue === '{yesterday}')   getDynamicTimestamps().yesterday
        else if (normalizedConditionValue === '{today}')  getDynamicTimestamps().today
        else if (normalizedConditionValue === '{start_of_month}')  getDynamicTimestamps().start_of_month

        switch (condition.operation_type) {
            case "eq":
                return normalizedTicketValue === normalizedConditionValue
            case "neq":
                return normalizedTicketValue !== normalizedConditionValue
            case "geq":
                return normalizedTicketValue >= normalizedConditionValue
            case "leq":
                return normalizedTicketValue <= normalizedConditionValue
            case "gt":
                return normalizedTicketValue > normalizedConditionValue
            case "lt":
                return normalizedTicketValue < normalizedConditionValue
            case "contains":
                return typeof normalizedTicketValue === 'string' && typeof normalizedConditionValue === 'string' ? normalizedTicketValue.includes(normalizedConditionValue) : false
            case "ncontains":
                return typeof normalizedTicketValue === 'string' && typeof normalizedConditionValue === 'string' ? !normalizedTicketValue.includes(normalizedConditionValue) : false
            default:
                return false
        }
    })
}

//MAIN FUNCTION
const DetermineConversationViews = (ticketData: ConversationsData | null | undefined, views:Views, userId:string ): ViewResult[]  => {
    
    if (!ticketData) return []

    const results: ViewResult[] = []
    const checkView = (view: View, type: 'private' | 'shared', index: number, userId:string) => {
        const meetsAll = view.all_conditions ? checkConditions(ticketData, view.all_conditions, userId): true
        const meetsAny = view.any_conditions ? view.any_conditions.length === 0 || checkConditions(ticketData, view.any_conditions, userId) : true
        
        if (meetsAll && meetsAny) {
            results.push({ view_type: type, view_index: index })
        }
    }

    if (views.private_views) views.private_views.forEach((view, index) => checkView(view, 'private', index, userId))
    if (views.shared_views) views.shared_views.forEach((view, index) => checkView(view, 'shared', index, userId))

    return results
}

export default DetermineConversationViews
