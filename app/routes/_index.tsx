import type {ActionFunction, LoaderFunction} from "@remix-run/node";
import SpinningWheel from "~/components/spinning-wheel";
import {json} from "@remix-run/node";
import {ShouldReloadFunction, useFetcher, useLoaderData} from "@remix-run/react";
import {commitSession, getSession} from "~/services/session.server";

// todo: user should authenticate
export let loader: LoaderFunction = async ({ request }) => {
    let causesResponse = await fetch(`https://api.daffy.org/public/api/v1/users/${process.env.USER_ID}/causes`, {
        method: "GET",
        headers: {
            "X-Api-Key": process.env.API_KEY,
            "Content-Type": "application/json"
        }
    });
    let session = await getSession(request);
    let cause = Number(session.get("cause") || "");

    let causes = await causesResponse.json();
    if (causes.error) {
        causes = []
    }
    return json({causes: causes, defaultCause: cause});
};


export let shouldRevalidate: ShouldReloadFunction = () => {
    return false;
};

export let action: ActionFunction = async ({ request }) => {
    // todo: handle api failures
    let session = await getSession(request);
    let formData = await request.formData();
    switch (formData.get("_action")) {
        case "set-cause":
            let formCause = formData.get("cause")

            session.set("cause", formCause);

            return json(null, {
                headers: { "Set-Cookie": await commitSession(session) },
            });
        case "get-non-profit":
            let cause = session.get("cause");
            let npResponse = await fetch(`https://api.daffy.org/public/api/v1/non_profits?cause_id=${cause || 1}`, {
                method: "GET",
                headers: {
                    "X-Api-Key": process.env.API_KEY,
                    "Content-Type": "application/json"
                }
            });
            let nonProfits = await npResponse.json();
            if (nonProfits.items) {
                let randomIdx = Math.floor(Math.random() * nonProfits.items.length);
                let nonProfit = nonProfits.items[randomIdx]
                return json({nonProfit});
            }
            return json(null);
        case "get-last-donation":
            // for now only handle the case with only 1 page of results
            let donationsResponse = await fetch(`https://api.daffy.org/public/api/v1/users/${process.env.USER_ID}/donations`, {
                method: "GET",
                headers: {
                    "X-Api-Key": process.env.API_KEY,
                    "Content-Type": "application/json"
                }
            });
            let donations = await donationsResponse.json();
            if (donations.items) {
                let lastDonation = donations.items[donations.items.length - 1]
                return json({nonProfit: lastDonation.non_profit, amount: lastDonation.amount});
            }
            return json(null);
        case "donate":
        case "prize-donate":
            let ein = formData.get("ein")
            let amount = formData.get("amount")
            if (!amount || !ein) {
                return json({error: "Amount/EIN cannot be empty"})
            }
            let response = await fetch(`https://api.daffy.org/public/api/v1/users/${process.env.USER_ID}/donations`, {
                method: "POST",
                headers: {
                    "X-Api-Key": process.env.API_KEY,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ein,
                    amount
                })
            });
            let donation = await response.json()
            let searchParams = new URLSearchParams({
                charity: donation.non_profit.id,
                step: "confirm",
                amount: donation.amount,
                visibility: "public",
                frequency: "one_time",
            });
            return json({ shareUrl: `https://www.daffy.org/donate?${searchParams}`});
        case "get-donate-url":
            let paramAmount = formData.get("amount")
            let paramNP = formData.get("id")

            let params = new URLSearchParams({
                charity: paramNP,
                step: "confirm",
                amount: paramAmount,
                visibility: "public",
                frequency: "one_time",
            });
            return json({ shareUrl: `https://www.daffy.org/donate?${params}`});
        case "prize-gift":
        case "gift":
            let name = formData.get("name")
            let amountGift = formData.get("amount")
            let giftResponse = await fetch(`https://api.daffy.org/public/api/v1/gifts`, {
                method: "POST",
                headers: {
                    "X-Api-Key": process.env.API_KEY,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name,
                    amount: amountGift
                })
            });
            let gift = await giftResponse.json()
            return json({url: gift.url});
        case "get-user":
            let userResponse = await fetch(`https://api.daffy.org/public/api/v1/users/me`, {
                method: "GET",
                headers: {
                    "X-Api-Key": process.env.API_KEY,
                    "Content-Type": "application/json"
                },
            });
            let user = await userResponse.json()
            return json({name: user.name});
        default:
            return json(null);
    }
}

export default function Index() {
   let {causes, defaultCause} = useLoaderData();
    let fetcher = useFetcher();

    function updateCause(event) {
        fetcher.submit(
            { cause: event.target.value, _action: "set-cause" },
            {
                method: "POST",
            }
        );
    }

    return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }} className="p-4 space-y-4">
      <h1 className="text-xl font-medium">The Giving Wheel</h1>
        <div className="max-w-md">
            <label htmlFor="cause" className="block text-sm font-medium leading-6 text-gray-900">Cause</label>
            <select id="cause" name="cause" onChange={updateCause} defaultValue={defaultCause}
                    className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
                {causes.map(cause => <option key={cause.id} value={cause.id}>{cause.name}</option>)}
            </select>
        </div>
      <SpinningWheel />
    </div>
  );
}
