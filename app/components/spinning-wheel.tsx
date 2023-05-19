import React, {Fragment, useEffect, useRef, useState} from 'react';
import { select, interpolate } from 'd3';
import { Transition, Dialog } from "@headlessui/react";
import Donate from "~/components/donate";
import {useFetcher} from "@remix-run/react";
import Gift from "~/components/gift";
import Surprise from "~/components/surprise";

const data = [
    {
        name: "Random donation",
        id: 1,
        description: "You can donate to a random non-profit!"
    },
    {
        name: "Duplicate last donation",
        id: 2,
        description: "Your last donation to XX of XX amount will be duplicated"
    },
    {
        name: "Challenge a Friend",
        id: 3,
        description: "A random non profit will be picked to invite your friends to donate $20 or more to them"
    },
    {
        name: "The gift of Giving",
        id: 4,
        description: "Gift $20 to a friend"
    },
    {
        name: "Donate & Match with Friends",
        id: 5,
        description: "You can donate to a random non-profit and invite friends to match it"
    },
    {
        name: "?",
        id: 6,
        description: "Surprise! You won:"
    }
];

const Wheel = () => {
    const wheelRef = useRef(null);
    let [result, setResult] = useState(null);
    let [accept, setAccept] = useState(false);
    let fetcher = useFetcher();
    let nonProfit = fetcher?.data?.nonProfit
    let amount = fetcher?.data?.amount

    function resetResult() {
        setResult(null);
        setAccept(false);
    }

    useEffect(() => {
        // todo: move this to each component and dont send non profit and amount
        if (!result || !accept || !!fetcher.data || fetcher.state !== "idle") return;
        if ([1, 3, 5, 6].includes(result.id)) {
            fetcher.submit(
                { _action: "get-non-profit" },
                {
                    method: "POST",
                }
            );
            return;
        }
        if (result.id === 2) {
            fetcher.submit(
                { _action: "get-last-donation" },
                {
                    method: "POST",
                }
            );
            return;
        }
    }, [result, accept, fetcher])

    function renderPrize() {
        let MODALS = {
            1: <Donate onClose={resetResult} nonProfit={nonProfit}/>,
            2: <Donate onClose={resetResult} nonProfit={nonProfit} defaultAmount={amount}/>,
            3: <Donate onClose={resetResult} nonProfit={nonProfit} challenge/>,
            4: <Gift onClose={resetResult}/>,
            5: <Donate onClose={resetResult} nonProfit={nonProfit} share/>,
            6: <Surprise onClose={resetResult} />,
        }
        return MODALS[result.id] || null;
    }

    const handleSpinClick = () => {
        setAccept(false);
        function getRandomInt(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min)) + min;
        }
        const spins = 3;
        const degrees = spins * 360;
        const piedegree = 360 / data.length;
        const randomAssetIndex  = getRandomInt(0, data.length);
        const randomPieMovement = getRandomInt(1, piedegree);
        let rotation = (data.length - randomAssetIndex) * piedegree - randomPieMovement + degrees;

        select(wheelRef.current)
            .selectAll('.wheel')
            .transition()
            .duration(3000)
            .attrTween('transform', rotTween)
            // .ease(d3.easeCircleOut)
            .on('end', function(){
                // console.log('Resultado obtenido:', data[randomAssetIndex].name);
                setResult(data[randomAssetIndex])
            });
        function rotTween() {
            let i = interpolate(0, rotation);
            return function(t) {
                return `rotate(${i(t)})`;
            };
        }
    };

    return (
        <div className="w-full flex flex-col justify-center items-center">
            {result && !accept &&
                <ConfirmModal
                    result={result}
                    onClose={resetResult}
                    setAccept={() => setAccept(true)}
                    nonProfit={nonProfit}
                />
            }
            {result && accept && renderPrize()}
            <div ref={wheelRef} >
                <svg width="500" height="500">
                    <g className="chartcontainer" transform="translate(250,250)">
                        <g className="wheel">
                            <g className="slice">
                                <path fill="#e5dff6" d="M0,-230A230,230,0,0,1,199.186,-115L0,0Z"></path>
                                <text transform="rotate(-60)translate(220)" textAnchor="end">Random donation</text>
                            </g>
                            <g className="slice">
                                <path fill="#e5f6df" d="M199.186,-115A230,230,0,0,1,199.186,115L0,0Z"></path>
                                <text transform="rotate(0)translate(220)" textAnchor="end">Duplicate last donation
                                </text>
                            </g>
                            <g className="slice">
                                <path fill="#dfe5f6" d="M199.186,115A230,230,0,0,1,0,230L0,0Z"></path>
                                <text transform="rotate(59.99999999999997)translate(220)" textAnchor="end">Challenge a
                                    Friend
                                </text>
                            </g>
                            <g className="slice">
                                <path fill="#ebd4f3" d="M0,230A230,230,0,0,1,-199.186,115L0,0Z"></path>
                                <text transform="rotate(119.99999999999997)translate(220)" textAnchor="end">The gift of
                                    Giving
                                </text>
                            </g>
                            <g className="slice">
                                <path fill="#f6f0df" d="M-199.186,115A230,230,0,0,1,-199.186,-115L0,0Z"></path>
                                <text transform="rotate(180)translate(220)" textAnchor="end">Donate &amp; Match with
                                    Friends
                                </text>
                            </g>
                            <g className="slice">
                                <path fill="#e5f6df" d="M-199.186,-115A230,230,0,0,1,0,-230L0,0Z"></path>
                                <text transform="rotate(239.99999999999994)translate(220)" textAnchor="end">?</text>
                            </g>
                        </g>
                    </g>
                    <g className="arrow" transform="translate(235, 12)">
                        <path d="M0 0 H30 L 15 25.980762113533157Z" style={{fill: "rgb(0, 8, 9)"}}></path>
                    </g>
                    <g className="chartcontainer" transform="translate(250,250)">
                        <g className="wheel">
                            <g className="slice">
                                <path fill="#e5dff6" d="M0,-230A230,230,0,0,1,199.186,-115L0,0Z"></path>
                                <text transform="rotate(-60)translate(220)" textAnchor="end">Random donation</text>
                            </g>
                            <g className="slice">
                                <path fill="#e5f6df" d="M199.186,-115A230,230,0,0,1,199.186,115L0,0Z"></path>
                                <text transform="rotate(0)translate(220)" textAnchor="end">Duplicate last donation
                                </text>
                            </g>
                            <g className="slice">
                                <path fill="#dfe5f6" d="M199.186,115A230,230,0,0,1,0,230L0,0Z"></path>
                                <text transform="rotate(59.99999999999997)translate(220)" textAnchor="end">Challenge a
                                    Friend
                                </text>
                            </g>
                            <g className="slice">
                                <path fill="#ebd4f3" d="M0,230A230,230,0,0,1,-199.186,115L0,0Z"></path>
                                <text transform="rotate(119.99999999999997)translate(220)" textAnchor="end">The gift of
                                    Giving
                                </text>
                            </g>
                            <g className="slice">
                                <path fill="#f6f0df" d="M-199.186,115A230,230,0,0,1,-199.186,-115L0,0Z"></path>
                                <text transform="rotate(180)translate(220)" textAnchor="end">Donate &amp; Match with
                                    Friends
                                </text>
                            </g>
                            <g className="slice">
                                <path fill="#e5f6df" d="M-199.186,-115A230,230,0,0,1,0,-230L0,0Z"></path>
                                <text transform="rotate(239.99999999999994)translate(220)" textAnchor="end">?</text>
                            </g>
                        </g>
                    </g>
                    <g className="arrow" transform="translate(235, 12)">
                        <path d="M0 0 H30 L 15 25.980762113533157Z" style={{fill: "rgb(0, 8, 9)"}}></path>
                    </g>
                </svg></div>
            <button onClick={handleSpinClick} className="border rounded-md p-3">Spin the Wheel!</button>
        </div>
    );
};

function ConfirmModal({result, onClose, setAccept, nonProfit}) {
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
                            <h2 className="text-xl font-medium">Congratulations!</h2>
                            <h3 className="text-lg">You got {result.name}</h3>
                            <h4 className="">{result.description}</h4>
                            <button className="p-4 border rounded-md" onClick={setAccept}>Take me to the prize</button>
                        </div>
                    </Dialog.Panel>
                </Transition.Child>
            </div>
        </Dialog>
    </Transition>
   )
}

export default Wheel;
