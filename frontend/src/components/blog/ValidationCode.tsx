import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"
  
  export function ValidationCode({ children, title = "検証ロジック（技術者向け）" }: { children: React.ReactNode, title?: string }) {
    return (
      <Accordion type="single" collapsible className="w-full my-4 border rounded-lg px-4 py-0 bg-slate-50/50">
        <AccordionItem value="item-1" className="border-none">
          <AccordionTrigger className="text-[15px] font-semibold text-emerald-600 hover:no-underline py-1">
            {title}
          </AccordionTrigger>
          <AccordionContent className="bg-white rounded-md border p-4">
            {children}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    )
  }