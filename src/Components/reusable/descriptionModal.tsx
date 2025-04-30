import Input from "../Input"
import Modal from "../Modal"

export const ModalText = ({ label, value }: { label: string, value: string }) => {
    return (
        <div className="w-full flex justify-between items-center gap-3 mb-3">
            <h2 className="w-[25%] block text-right text-mytextcolor">{label}</h2>
            <div className="w-[75%]">
                <Input className="w-full" v={value} />
            </div>
        </div>
    )
}


type Props = {
    closeModal: any,
    open: boolean,
    title: string,
    items: { text: string, value: string }[][]
}

const DescriptionModal = ({ closeModal, open, title, items }: Props) => {
    return (
        <Modal
            open={open}
            closeModal={closeModal}
            title={title}
            w="80%"
            className="bg-[#ECF3F7] dark:bg-mybackground"
        >
            {
                <div className="flex gap-3">
                    {
                        items.map((item, index) => (
                            <div className={`w-1/${items.length}`} key={index}>
                                {
                                    item.map((i, ind) => (
                                        <ModalText key={ind} label={i.text} value={i.value} />
                                    ))
                                }
                            </div>
                        ))
                    }
                </div>
            }
        </Modal>
    )
}

export default DescriptionModal