import { Transition, Dialog } from "@headlessui/react";
import React, {Fragment, useEffect, useState} from "react";
import {Form, useFetcher} from "@remix-run/react";

// todo: for now since we don't authenticate users and we only have 1 user id on the env file, this only generates a donation/gift made by the user
function DuplicateLastDonation({onClose}) {
    let fetcher = useFetcher();
    let nonProfit = fetcher?.data?.nonProfit
    let amount = fetcher?.data?.amount

    useEffect(() => {
        if (!!fetcher.data || fetcher.state !== "idle") return;
        fetcher.submit(
            { _action: "get-last-donation" },
            {
                method: "POST",
            }
        );
    }, [fetcher])

    return (
        <Form method="POST" className="space-y-2 flex flex-col">
            <h2>We will duplicate your last donation!</h2>
            <h3>Check the details below:</h3>
            <input hidden defaultValue="prize-donate" name="_action"/>
            {nonProfit && nonProfit?.ein &&
                <div className="flex items-center gap-2">
                    <input hidden defaultValue={nonProfit.ein} name="ein"/>
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
            {amount &&
                <div className="flex items-center gap-2">
                    <p>Amount</p>
                    <p>{amount}</p>
                </div>
            }
            {/*<p>Note</p>*/}
            <div className="flex items-center justify-around">
                <button className="p-2 border rounded-md" onClick={onClose}>Cancel</button>
                <button type="submit" className="p-2 border rounded-md">Donate</button>
            </div>
        </Form>
    )
}
function Gift({onClose}) {
    let userFetcher = useFetcher();
    let giftFetcher = useFetcher();

    useEffect(() => {
        if (!!userFetcher.data || userFetcher.state !== "idle") return;
        userFetcher.submit(
            { _action: "get-user" },
            {
                method: "POST",
            }
        );
    }, [userFetcher])

    return (
        <giftFetcher.Form method="POST" className="space-y-2 flex flex-col">
            <h2>You just won a Daffy Gift on us!</h2>
            <h3>Check the details below:</h3>
            <input hidden defaultValue="prize-gift" name="_action"/>
            <input hidden defaultValue="20" name="amount"/>
            {userFetcher?.data?.name &&
                <>
                    <input hidden defaultValue={userFetcher.data.name} name="name"/>
                    <div className="flex items-center gap-2">
                        <p>Name</p>
                        <p>{userFetcher.data.name}</p>
                    </div>
                </>
            }
            <div className="flex items-center gap-2">
                <p>Amount</p>
                <p>20</p>
            </div>

            {/*<p>Note</p>*/}
            <div className="flex items-center justify-around">
                <button className="p-2 border rounded-md" onClick={onClose}>Cancel</button>
                <button type="submit" className="p-2 border rounded-md">Get Gift</button>
            </div>
            {!!giftFetcher?.data?.url &&
                <div>
                    <p>Here's your gift</p>
                    <p className="select-all whitespace-nowrap overflow-hidden text-ellipsis">{giftFetcher.data.url}</p>
                </div>
            }
        </giftFetcher.Form>
    )
}
function MatchDonation({onClose}) {
    let fetcher = useFetcher();
    let nonProfit = fetcher?.data?.nonProfit

    useEffect(() => {
        if (!!fetcher.data || fetcher.state !== "idle") return;
        fetcher.submit(
            { _action: "get-non-profit" },
            {
                method: "POST",
            }
        );
    }, [fetcher])

    return (
        <Form method="POST" className="space-y-2 flex flex-col">
            <h2>We math your donation</h2>
            <h3>Check the details below:</h3>
            <input hidden defaultValue="prize-donate" name="_action"/>
            {nonProfit && nonProfit.ein &&
                <div className="flex items-center gap-2">
                    <input hidden defaultValue={nonProfit.ein} name="ein"/>
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
                <input name="amount" className="border p-2 rounded-md" defaultValue={20} type="number" min="18"/>
            </div>
            {/*<p>Note</p>*/}
            <div className="flex items-center justify-around">
                <button className="p-2 border rounded-md" onClick={onClose}>Cancel</button>
                <button type="submit" className="p-2 border rounded-md">Donate</button>
            </div>
        </Form>
    )
}

export default function Surprise({onClose = () => {}}) {
    let [prize, setPrize] = useState<null | number>(null);

    useEffect(() => {
        let random = Math.floor(Math.random() * 2);
        setPrize(2)
    }, [])

    // 0: you duplicate their last donation
    // 1: you gift them $20
    // 2: they make a donation, and you match it
    let PRIZES = {
        0: DuplicateLastDonation,
        1: Gift,
        2: MatchDonation,
    }
    let Prize = PRIZES[prize]
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
                            <div className="mt-10 md:my-20 -md:w-full bg-white md:w-[568px] md:rounded-xl px-5 pt-6 pb-8 md:p-[60px] md:pt-12 rounded-t-lg transition-all transform overflow-hidden">
                                {prize !== null && Prize && <Prize onClose={onClose}/>}
                            </div>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    );
}