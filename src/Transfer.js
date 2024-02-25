import React, { useState } from 'react'
import { Form } from 'semantic-ui-react'
import { TxButton } from './substrate-lib/components'
import { useSubstrateState } from './substrate-lib'
import {
  Box,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import { ArrowRightAlt, KeyboardArrowDown } from '@mui/icons-material'
import { useThemeContext } from './theme/ThemeContextProvider'
import { makeStyles } from '@material-ui/core'

export default function Main(props) {
  const [status, setStatus] = useState(null)
  const [formState, setFormState] = useState({ addressTo: '', amount: 0 })

  // const onChange = (_, data) =>
  //   setFormState(prev => ({ ...prev, [data.state]: data.value }))

  const { mode } = useThemeContext()
  const useStyles = makeStyles({
    input: {
      '& .MuiFilledInput-input': {
        paddingLeft: '15px',
        paddingTop: '15px',
        paddingBottom: '10px',
        height: '27px',
        borderRadius: '0px',
      },
    },
  })

  const classes = useStyles()

  const { addressTo, amount } = formState

  const { keyring } = useSubstrateState()
  const accounts = keyring.getPairs()

  const availableAccounts = []
  accounts.map(account => {
    return availableAccounts.push({
      key: account.meta.name,
      text: account.meta.name,
      value: account.address,
    })
  })

  const [dropdownLabel, setDropdownLabel] = useState('')

  return (
    <Box>
      <Typography
        fontSize={'26px'}
        fontWeight={'600'}
        sx={{ mb: '20px' }}
        color={mode === 'light' ? '#3f3f3f' : '#b8b3b9'}
      >
        Transfer
      </Typography>
      <Form>
        <Box
          sx={{
            pl: 1,
            py: 1.3,
            borderRadius: '5px',
            display: 'flex',
            alignItems: 'center',
            border: '1px solid #d33079',
            gap: '40px',
            width: '55%',
          }}
        >
          <ArrowRightAlt color="primary" fontSize="medium" />
          <Typography
            color={mode === 'light' ? '#555555' : '#938e94'}
            component={'span'}
            sx={{ mt: '2px' }}
          >
            1 Unit = 100000000000000
          </Typography>
        </Box>
        <Box
          sx={{
            pl: 1,
            py: 1.3,
            borderRadius: '5px',
            display: 'flex',
            alignItems: 'center',
            border: '1px solid #d33079',
            gap: '40px',
            width: '75%',
            mt: '10px',
          }}
        >
          <ArrowRightAlt color="primary" fontSize="medium" />
          <Typography
            color={mode === 'light' ? '#555555' : '#938e94'}
            component={'span'}
            sx={{ mt: '2px' }}
          >
            Transfer more than the existential amount for account with 0 balance
          </Typography>
        </Box>

        <Select
          sx={{
            mt: '20px',
            width: '100%',
            backgroundColor: mode === 'light' ? '#fff' : '#383438',
            border: 'none',
            outline: 'none',
            borderRadius: '5px',
            '& .MuiSelect-icon': {
              color: '#ddd',
            },
            '.MuiOutlinedInput-notchedOutline': { border: 0 },
          }}
          placeholder="Select From Available Addresses"
          IconComponent={KeyboardArrowDown}
          displayEmpty
          value={dropdownLabel}
          onChange={e => {
            setDropdownLabel(e.target.value)
            setFormState({ ...formState, addressTo: e.target.value })
          }}
        >
          <MenuItem value="" disabled>
            Select From Available Addresses
          </MenuItem>
          {availableAccounts.map(account => (
            <MenuItem value={account.value}>{account.text}</MenuItem>
          ))}
        </Select>

        <TextField
          variant="filled"
          onChange={e =>
            setFormState({ ...formState, addressTo: e.target.value })
          }
          placeholder="Address"
          sx={{
            width: '100%',
            backgroundColor: 'primary.main',
            marginTop: '20px',
            '& input::placeholder': {
              color: '#a9a9a9',
            },
          }}
          className={classes.input}
          InputProps={{
            disableUnderline: true,
            inputProps: {
              style: {
                background: mode === 'light' ? '#fff' : '#383438',
                color: mode === 'light' ? '#555555' : '#938e94',
                borderRadius: '0px',
              },
            },
            startAdornment: (
              <InputAdornment
                position="start"
                sx={{
                  px: '8px',
                  py: '0px',
                }}
              >
                <Typography
                  variant="body2"
                  component={'p'}
                  color={'#fff'}
                  sx={{
                    fontWeight: '600',
                    fontSize: '14px',
                    mt: '-15px',
                    mr: '5px',
                  }}
                >
                  To
                </Typography>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          type="number"
          onChange={e => setFormState({ ...formState, amount: e.target.value })}
          variant="filled"
          sx={{
            width: '100%',
            backgroundColor: 'primary.main',
            marginTop: '20px',
          }}
          className={classes.input}
          InputProps={{
            disableUnderline: true,
            inputProps: {
              style: {
                background: mode === 'light' ? '#fff' : '#383438',
                color: mode === 'light' ? '#555555' : '#938e94',
                borderRadius: '0px',
              },
            },
            startAdornment: (
              <InputAdornment
                position="start"
                sx={{
                  px: '4px',
                  py: '0px',
                }}
              >
                <Typography
                  variant="body2"
                  component={'p'}
                  color={'#fff'}
                  sx={{
                    fontWeight: '600',
                    fontSize: '14px',
                    mt: '-15px',
                    mr: '5px',
                  }}
                >
                  Amount
                </Typography>
              </InputAdornment>
            ),
          }}
        />
        <Box sx={{ mt: '20px' }}>
          <TxButton
            label="Submit"
            type="SIGNED-TX"
            setStatus={setStatus}
            attrs={{
              palletRpc: 'balances',
              callable: 'transfer',
              inputParams: [addressTo, amount],
              paramFields: [true, true],
            }}
          />
        </Box>
        <div style={{ overflowWrap: 'break-word' }}>{status}</div>
      </Form>
    </Box>
  )
}
