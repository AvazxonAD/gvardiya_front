import { CSSProperties, ReactNode } from "react"

export type ITheadItem = {
    className?: string,
    text: string
}

type Props = {
    thead: ITheadItem[],
    children: ReactNode,
    theadClassName?: string,
    tableClassName?: string,
    tbodyClassName?: string,
    tbodyStyle?: CSSProperties,
    tableStyle?: CSSProperties,
    theadStyle?: CSSProperties
}

const Table = ({ thead, children, theadClassName, tableClassName, tbodyClassName, tbodyStyle, tableStyle, theadStyle }: Props) => {
    return (
        <div className={tableClassName ?? ""} style={tableStyle}>
            <table className={`w-full`}>
                <thead style={theadStyle} className={`bg-mytablehead text-[#323232] border border-mytableheadborder text-[14px] ${theadClassName ?? ""}`}>
                    <tr className="uppercase text-sm leading-normal">
                        {
                            thead.map((e, ind) => (
                                <th className={`py-3 px-6 text-mytextcolor ${e.className || ""}`} key={ind}>
                                    {e.text}
                                </th>
                            ))
                        }
                    </tr>
                </thead>
                <tbody style={tbodyStyle} className={`text-mytextcolor text-sm font-light ${tbodyClassName ?? ""}`}>
                    {children}
                </tbody>
            </table>
        </div>
    )
}


export default Table;