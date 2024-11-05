# XRPL utility


## Examples

```bash
# change your working directory to this example first
cd examples/evm/xrpl-txs

# export all required environments
export CALLER_PRIVATE_KEY=s**** amount=1 currency=53594C4F00000000000000000000000000000000 destination=rnZiKvrWFGi2JfHtLS8kxcqCqVhch6W5k5 issuer=rPaqStERf9Te6HzbQKrcQW6bhiVRgphZsA trnAddress=0x6D1eFDE1BbF146EF88c360AF255D9d54A5D39408

# transfer xrpl token
pnpm call:transfer

```

```bash
export rippleAddress="rPaqStERf9Te6HzbQKrcQW6bhiVRgphZsA"
pnpm call:toTRNAddress
```

```bash
export trnAddress=0x6D1eFDE1BbF146EF88c360AF255D9d54A5D39408
pnpm call:toRippleAddress
```

```bash
# export all required environments
export CALLER_PRIVATE_KEY=s**** amount=1 currency=524F4F5400000000000000000000000000000000 issuer=rLc3mbdf4mHhH2n6ur6jzgdF8Jb2eZTJFW

# transfer xrpl token
pnpm call:trustline

```
