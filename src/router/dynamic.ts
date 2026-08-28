import type{AdminMenuRule} from "@/mock/adminMenu";
import type {Router, RouteRecordRaw} from "vue-router";

const viewComponents = import.meta.glob("/src/views/**/*.vue")

export function registerDynamicRoutes(router:Router,rules:AdminMenuRule[]):string[]{
    const registeredNames:string[] = []
    for (let rule of rules) {
        if(rule.type != "menu" || rule.menuType!='tab'||!rule.component)
            continue
        if (router.hasRoute(rule.name))
            continue
        const viewComponent = viewComponents[rule.component];
        if (!viewComponent){
            console.warn(`[dynamic-route] 找不到页面组件：${rule.component}`)
            continue
        }
        const routeBaseInfo:RouteRecordRaw={
            path: rule.path,
            name: rule.name,
            component: viewComponent,
        }
        router.addRoute('admin',routeBaseInfo)
        registeredNames.push(rule.name)
    }
    return registeredNames
}