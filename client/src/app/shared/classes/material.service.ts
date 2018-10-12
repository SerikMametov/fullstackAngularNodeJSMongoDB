//Material Design - это язык дизайна, который сочетает в себе классические принципы успешного дизайна и инноваций и технологий.
// Целью Google является разработка системы дизайна, которая позволяет использовать единый пользовательский интерфейс для всех своих продуктов на любой платформе.

import {ElementRef} from "@angular/core";

declare var M

export interface MaterialInstance {
  open?(): void
  close?(): void
  destroy?(): void
}

export interface MaterialDatepicker extends MaterialInstance {
  date?: Date
}

export class MaterialService {
  static toast(message: string) {
    //из сайта https://materializecss.com/toasts.html просто напишем как выводить сообщение
    M.toast({html: message})
  }

  static initializeFloatingButton(ref: ElementRef) {
    M.FloatingActionButton.init(ref.nativeElement)
  }

  static updateTextInputs(){
    M.updateTextFields()
  }

  static initModal(ref: ElementRef): MaterialInstance {
    return M.Modal.init(ref.nativeElement)
  }

  static initTooltip(ref: ElementRef): MaterialInstance {
    return M.Tooltip.init(ref.nativeElement)
  }

  static initDatepicker(ref: ElementRef, onClose: () => void): MaterialDatepicker {
    return M.Datepicker.init(ref.nativeElement, {
      format: 'dd.mm.yyyy',
      showClearBtn: true,
      onClose
    })
  }

  static initTabTarget(ref: ElementRef): MaterialInstance{
    return M.TapTarget.init(ref.nativeElement)
  }
}
