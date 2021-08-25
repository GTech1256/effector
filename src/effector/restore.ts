import {createStore} from './createUnit'
import {is} from './is'
import {forIn} from './collection'
import {getParent} from './getter'
import {OPEN_O} from './tag'
import {createLinkNode} from './forward'

export function restore(obj: any, defaultState: any, config?: any): any {
  if (is.store(obj)) return obj
  if (is.event(obj) || is.effect(obj)) {
    const domain = getParent(obj)
    const result = createStore(defaultState, {
      parent: domain,
      name: obj.shortName,
      [OPEN_O]: config,
    })
    createLinkNode(is.effect(obj) ? obj.doneData : obj, result)
    if (domain) domain.hooks.store(result)
    return result
  }
  const result: Record<string, any> = Array.isArray(obj) ? [] : {}
  forIn(
    obj,
    (value, key) =>
      (result[key] = is.store(value) ? value : createStore(value, {name: key})),
  )
  return result
}
