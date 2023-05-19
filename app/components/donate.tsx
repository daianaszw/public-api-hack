import { Transition, Dialog } from "@headlessui/react";
import React, {Fragment} from "react";
import {useFetcher} from "@remix-run/react";

export default function Donate({onClose = () => {}, nonProfit, defaultAmount = "", share = false, challenge = false}) {
    let fetcher = useFetcher()
    return (
        <Transition appear show as={Fragment}>
            <Dialog
                as="div"
                className="fixed inset-0 z-50 bg-neutral-800 bg-opacity-60 min-h-screen min-h-screen-ios overflow-y-auto overflow-x-hidden"
                onClose={onClose}
            >
                <div className="flex min-h-full items-baseline justify-center -md:items-end">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <Dialog.Panel>
                            <fetcher.Form method="POST" className="space-y-2 flex flex-col mt-10 md:my-20 -md:w-full bg-white md:w-[568px] md:rounded-xl px-5 pt-6 pb-8 md:p-[60px] md:pt-12 rounded-t-lg transition-all transform overflow-hidden">
                                {challenge ?
                                    <input hidden defaultValue="get-donate-url" name="_action"/> :
                                    <input hidden defaultValue="donate" name="_action"/>
                                }
                                {nonProfit && nonProfit.ein &&
                                    <div className="flex items-center gap-2">
                                        <input hidden defaultValue={nonProfit.ein} name="ein"/>
                                        <input hidden defaultValue={nonProfit.id} name="id"/>
                                        <div className="flex items-center gap-2">
                                            <p>Non Profit</p>
                                            <p>{nonProfit.name}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <p>EIN</p>
                                            <p>{nonProfit.ein}</p>
                                        </div>
                                    </div>
                                }
                                <div className="flex items-center gap-2">
                                    <p>Amount</p>
                                    <input name="amount" className="border p-2 rounded-md" defaultValue={defaultAmount || 20} type="number" min="18"/>
                                </div>
                                {/*<p>Note</p>*/}
                                <div className="flex items-center justify-around">
                                    <button className="p-2 border rounded-md" onClick={onClose}>Cancel</button>
                                    {challenge ?
                                        <button type="submit" className="p-2 border rounded-md">Challenge your friends</button> :
                                        <button type="submit" className="p-2 border rounded-md">Donate</button>
                                    }
                                </div>
                                {share && fetcher?.data?.shareUrl &&
                                    <div>
                                        <p>Invite your friends to match your donation on Daffy!</p>
                                        <p className="select-all whitespace-nowrap overflow-hidden text-ellipsis">{fetcher.data.shareUrl}</p>
                                    </div>
                                }
                                {challenge && fetcher?.data?.shareUrl &&
                                    <div>
                                        <p>Share this link with them to donate on Daffy</p>
                                        <p className="select-all whitespace-nowrap overflow-hidden text-ellipsis">{fetcher.data.shareUrl}</p>
                                    </div>
                                }
                            </fetcher.Form>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    );
}