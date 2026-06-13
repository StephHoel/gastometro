import React from 'react'
import { Text } from 'react-native'
import { render } from '@testing-library/react-native'
import { CustomButton } from '@/components/Button'
import { Card } from '@/components/Card'
import { Divider } from '@/components/Divider'
import { Loading } from '@/components/Loading'
import { Row } from '@/components/Row'
import { Screen, KeyboardScreen } from '@/components/Screen'
import { TextWhite } from '@/components/TextWhite'

describe('Basic components', () => {
  it('CustomButton deve renderizar filhos', () => {
    const { getByText } = render(
      <CustomButton>
        <Text>Enviar</Text>
      </CustomButton>
    )

    expect(getByText('Enviar')).toBeTruthy()
  })

  it('CustomButton deve aplicar variações de tipo e subcomponentes', () => {
    const { getByText, rerender } = render(
      <CustomButton type="Fail">
        <CustomButton.Icon>
          <Text>!</Text>
        </CustomButton.Icon>
        <CustomButton.Text>Excluir</CustomButton.Text>
      </CustomButton>
    )

    expect(getByText('Excluir')).toBeTruthy()
    expect(getByText('!')).toBeTruthy()

    rerender(
      <CustomButton type="Normal">
        <CustomButton.Text className="text-sm">Neutro</CustomButton.Text>
      </CustomButton>
    )

    expect(getByText('Neutro')).toBeTruthy()
  })

  it('Divider deve aceitar className adicional', () => {
    const { toJSON } = render(<Divider className="border-red-500" />)
    expect(toJSON()).toBeTruthy()
  })

  it('Card, Divider e TextWhite devem funcionar com className padrão', () => {
    const { getByText, toJSON } = render(
      <Card>
        <TextWhite>texto</TextWhite>
        <Divider />
      </Card>
    )

    expect(getByText('texto')).toBeTruthy()
    expect(toJSON()).toBeTruthy()
  })

  it('Loading deve renderizar sem quebrar', () => {
    const { toJSON } = render(<Loading />)
    expect(toJSON()).toBeTruthy()
  })

  it('Row e Screen devem renderizar children', () => {
    const { getByText } = render(
      <Screen>
        <Row>
          <Text>conteudo</Text>
        </Row>
      </Screen>
    )

    expect(getByText('conteudo')).toBeTruthy()
  })

  it('KeyboardScreen deve renderizar children', () => {
    const { getByText } = render(
      <KeyboardScreen>
        <Text>conteudo</Text>
      </KeyboardScreen>
    )

    expect(getByText('conteudo')).toBeTruthy()
  })
})
