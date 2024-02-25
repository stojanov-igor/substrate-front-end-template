import React, { useEffect, useState } from 'react'
import { Form } from 'semantic-ui-react'

import { useSubstrateState } from './substrate-lib'
import { TxButton, TxGroupButton } from './substrate-lib/components'
import {
  Box,
  FormControl,
  FormControlLabel,
  InputAdornment,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import { KeyboardArrowDown } from '@mui/icons-material'
import { useThemeContext } from './theme/ThemeContextProvider'
import { makeStyles } from '@material-ui/core'

const argIsOptional = arg => arg.type.toString().startsWith('Option<')

function Main(props) {
  const { api, jsonrpc } = useSubstrateState()
  const [status, setStatus] = useState(null)

  const [interxType, setInterxType] = useState('EXTRINSIC')
  const [palletRPCs, setPalletRPCs] = useState([])
  const [callables, setCallables] = useState([])
  const [paramFields, setParamFields] = useState([])
  const [palletDropdownLabel, setPalletDropdownLabel] = useState('')
  const [callableDropdownLabel, setCallableDropdownLabel] = useState('')

  const initFormState = {
    palletRpc: '',
    callable: '',
    inputParams: [],
  }

  const [formState, setFormState] = useState(initFormState)
  const { palletRpc, callable, inputParams } = formState

  const getApiType = (api, interxType) => {
    if (interxType === 'QUERY') {
      return api.query
    } else if (interxType === 'EXTRINSIC') {
      return api.tx
    } else if (interxType === 'RPC') {
      return api.rpc
    } else {
      return api.consts
    }
  }

  const updatePalletRPCs = () => {
    if (!api) {
      return
    }
    const apiType = getApiType(api, interxType)
    const palletRPCs = Object.keys(apiType)
      .sort()
      .filter(pr => Object.keys(apiType[pr]).length > 0)
      .map(pr => ({ key: pr, value: pr, text: pr }))
    setPalletRPCs(palletRPCs)
  }

  const updateCallables = () => {
    if (!api || palletRpc === '') {
      return
    }
    const callables = Object.keys(getApiType(api, interxType)[palletRpc])
      .sort()
      .map(c => ({ key: c, value: c, text: c }))
    setCallables(callables)
  }

  const updateParamFields = () => {
    if (!api || palletRpc === '' || callable === '') {
      setParamFields([])
      return
    }

    let paramFields = []

    if (interxType === 'QUERY') {
      const metaType = api.query[palletRpc][callable].meta.type
      if (metaType.isPlain) {
        // Do nothing as `paramFields` is already set to []
      } else if (metaType.isMap) {
        paramFields = [
          {
            name: metaType.asMap.key.toString(),
            type: metaType.asMap.key.toString(),
            optional: false,
          },
        ]
      } else if (metaType.isDoubleMap) {
        paramFields = [
          {
            name: metaType.asDoubleMap.key1.toString(),
            type: metaType.asDoubleMap.key1.toString(),
            optional: false,
          },
          {
            name: metaType.asDoubleMap.key2.toString(),
            type: metaType.asDoubleMap.key2.toString(),
            optional: false,
          },
        ]
      }
    } else if (interxType === 'EXTRINSIC') {
      const metaArgs = api.tx[palletRpc][callable].meta.args

      if (metaArgs && metaArgs.length > 0) {
        paramFields = metaArgs.map(arg => ({
          name: arg.name.toString(),
          type: arg.type.toString(),
          optional: argIsOptional(arg),
        }))
      }
    } else if (interxType === 'RPC') {
      let metaParam = []

      if (jsonrpc[palletRpc] && jsonrpc[palletRpc][callable]) {
        metaParam = jsonrpc[palletRpc][callable].params
      }

      if (metaParam.length > 0) {
        paramFields = metaParam.map(arg => ({
          name: arg.name,
          type: arg.type,
          optional: arg.isOptional || false,
        }))
      }
    } else if (interxType === 'CONSTANT') {
      paramFields = []
    }

    setParamFields(paramFields)
  }

  useEffect(updatePalletRPCs, [api, interxType])
  useEffect(updateCallables, [api, interxType, palletRpc])
  useEffect(updateParamFields, [api, interxType, palletRpc, callable, jsonrpc])

  const onPalletCallableParamChange = (_, data) => {
    setFormState(formState => {
      let res
      const { state, value } = data
      if (typeof state === 'object') {
        // Input parameter updated
        const {
          ind,
          paramField: { type },
        } = state
        const inputParams = [...formState.inputParams]
        inputParams[ind] = { type, value }
        res = { ...formState, inputParams }
      } else if (state === 'palletRpc') {
        res = { ...formState, [state]: value, callable: '', inputParams: [] }
      } else if (state === 'callable') {
        res = { ...formState, [state]: value, inputParams: [] }
      }
      return res
    })
  }

  const onInterxTypeChange = e => {
    setInterxType(e.target.value)
    // clear the formState
    setFormState(initFormState)
  }

  // const getOptionalMsg = interxType =>
  //   interxType === 'RPC'
  //     ? 'Optional Parameter'
  //     : 'Leaving this field as blank will submit a NONE value'

  const { mode } = useThemeContext()

  const useStyles = makeStyles({
    input: {
      '& .MuiFilledInput-input': {
        paddingLeft: '15px',
        paddingTop: '15px',
        paddingBottom: '10px',
        height: '24px',
        borderRadius: '0px',
      },
    },
  })

  const classes = useStyles()

  return (
    <Box sx={{ mt: '30px' }}>
      <Typography
        color={mode === 'light' ? '#3f3f3f' : '#b8b3b9'}
        fontSize={'26px'}
        fontWeight={'600'}
        sx={{ mb: '10px' }}
      >
        Pallet Interactor
      </Typography>
      <Form>
        <FormControl component="fieldset" style={{ overflowX: 'auto' }}>
          <Typography
            sx={{ fontSize: '16px', my: 0.5 }}
            color={mode === 'light' ? '#555555' : '#938e94'}
          >
            Interaction Type
          </Typography>
          <RadioGroup
            row
            name="interxType"
            value={interxType}
            onChange={onInterxTypeChange}
          >
            <FormControlLabel
              value="EXTRINSIC"
              label={
                <Typography
                  sx={{ fontSize: '12px' }}
                  color={mode === 'light' ? '#555555' : '#938e94'}
                >
                  Extrinsic
                </Typography>
              }
              control={<Radio />}
            />
            <FormControlLabel
              label={
                <Typography
                  sx={{ fontSize: '12px' }}
                  color={mode === 'light' ? '#555555' : '#938e94'}
                >
                  Query
                </Typography>
              }
              value="QUERY"
              control={<Radio />}
            />
            <FormControlLabel
              value="RPC"
              control={<Radio />}
              label={
                <Typography
                  sx={{ fontSize: '12px' }}
                  color={mode === 'light' ? '#555555' : '#938e94'}
                >
                  RPC
                </Typography>
              }
            />
            <FormControlLabel
              color={mode === 'light' ? '#555555' : '#938e94'}
              value="CONSTANT"
              control={<Radio />}
              label={
                <Typography
                  sx={{ fontSize: '12px' }}
                  color={mode === 'light' ? '#555555' : '#938e94'}
                >
                  Constant
                </Typography>
              }
            />
          </RadioGroup>
        </FormControl>

        <Select
          sx={{
            mt: '10px',
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
          IconComponent={KeyboardArrowDown}
          displayEmpty
          value={palletDropdownLabel}
          onChange={e => {
            setPalletDropdownLabel(e.target.value)
            onPalletCallableParamChange(e, {
              state: 'palletRpc',
              value: e.target.value,
            })
          }}
        >
          <MenuItem value="" disabled>
            Pallets / RPC
          </MenuItem>
          {palletRPCs.map(rp => (
            <MenuItem value={rp.value}>{rp.text}</MenuItem>
          ))}
        </Select>
        <Select
          sx={{
            mt: '10px',
            mb: '15px',
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
          IconComponent={KeyboardArrowDown}
          displayEmpty
          value={callableDropdownLabel}
          onChange={e => {
            setCallableDropdownLabel(e.target.value)
            onPalletCallableParamChange(e, {
              state: 'callable',
              value: e.target.value,
            })
          }}
        >
          <MenuItem value="" disabled>
            Callables
          </MenuItem>
          {callables.map(c => (
            <MenuItem value={c.value}>{c.text}</MenuItem>
          ))}
        </Select>

        {paramFields.map((paramField, ind) => (
          <TextField
            type="number"
            value={inputParams[ind] ? inputParams[ind].value : ''}
            onChange={e =>
              onPalletCallableParamChange(e, {
                state: { ind, paramField },
                value: e.target.value,
              })
            }
            variant="filled"
            sx={{
              width: '100%',
              backgroundColor: 'primary.main',
              mt: '10px',
              mb: '15px',
            }}
            className={classes.input}
            placeholder={paramField.type}
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
                    {paramField.name}
                  </Typography>
                </InputAdornment>
              ),
            }}
          />
          // <Form.Field key={`${paramField.name}-${paramField.type}`}>
          //   <Input
          //     placeholder={paramField.type}
          //     fluid
          //     type="text"
          //     label={paramField.name}
          //     state={{ ind, paramField }}
          //     value={inputParams[ind] ? inputParams[ind].value : ''}
          //     onChange={onPalletCallableParamChange}
          //   />
          //   {paramField.optional ? (
          //     <Label
          //       basic
          //       pointing
          //       color="teal"
          //       content={getOptionalMsg(interxType)}
          //     />
          //   ) : null}
          // </Form.Field>
        ))}
        <InteractorSubmit
          setStatus={setStatus}
          attrs={{
            interxType,
            palletRpc,
            callable,
            inputParams,
            paramFields,
          }}
        />
        <div style={{ overflowWrap: 'break-word' }}>{status}</div>
      </Form>
    </Box>
  )
}

function InteractorSubmit(props) {
  const {
    attrs: { interxType },
  } = props
  if (interxType === 'QUERY') {
    return <TxButton label="Query" type="QUERY" color="primary" {...props} />
  } else if (interxType === 'EXTRINSIC') {
    return <TxGroupButton {...props} />
  } else if (interxType === 'RPC' || interxType === 'CONSTANT') {
    return (
      <TxButton label="Submit" type={interxType} color="primary" {...props} />
    )
  }
}

export default function Interactor(props) {
  const { api } = useSubstrateState()
  return api.tx ? <Main {...props} /> : null
}
