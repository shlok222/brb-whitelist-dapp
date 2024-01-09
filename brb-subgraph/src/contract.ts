import { AddressAddedToWhitelist as AddressAddedToWhitelistEvent } from "../generated/Contract/Contract"
import { AddressAddedToWhitelist } from "../generated/schema"

export function handleAddressAddedToWhitelist(
  event: AddressAddedToWhitelistEvent
): void {
  let entity = new AddressAddedToWhitelist(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.whitelistedAddress = event.params.whitelistedAddress

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
