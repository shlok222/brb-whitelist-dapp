import { newMockEvent } from "matchstick-as"
import { ethereum, Address } from "@graphprotocol/graph-ts"
import { AddressAddedToWhitelist } from "../generated/Contract/Contract"

export function createAddressAddedToWhitelistEvent(
  whitelistedAddress: Address
): AddressAddedToWhitelist {
  let addressAddedToWhitelistEvent = changetype<AddressAddedToWhitelist>(
    newMockEvent()
  )

  addressAddedToWhitelistEvent.parameters = new Array()

  addressAddedToWhitelistEvent.parameters.push(
    new ethereum.EventParam(
      "whitelistedAddress",
      ethereum.Value.fromAddress(whitelistedAddress)
    )
  )

  return addressAddedToWhitelistEvent
}
