import type {AdminMenuRule} from "@/mock/adminMenu";
import type {Router, RouteRecordRaw} from "vue-router";


const viewComponents = import.meta.glob("/src/views/**/*.vue")
type ViewComponent = NonNullable<(typeof viewComponents)[string]>

export function addRouteAll(router: Router, rules: AdminMenuRule[]) {
    for (const rule of rules) {
        if (rule.type == 'menu_dir' && rule.children && rule.children.length != 0)
            addRouteAll(router, rule.children)
        if (rule.type !== 'menu' || rule.menuType !== 'tab' || !rule.component || !rule.path)
            continue
        const viewComponent = viewComponents[rule.component];
        if (!viewComponent) {
            console.warn(
                `[dynamic-route] 找不到页面组件：${rule.component}`,
            )
            continue
        }
        addRouteItem(router, rule, viewComponent)

    }
}

function addRouteItem(router: Router, rule: AdminMenuRule, viewComponent: ViewComponent) {
    if (router.hasRoute(rule.name) || !rule.path)
        return
    const routeBaseInfo: RouteRecordRaw = {
        path: rule.path,
        name: rule.name,
        component: viewComponent,
    }
    router.addRoute('admin', routeBaseInfo)
    // registeredNames.push(rule.name)
}