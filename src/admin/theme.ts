import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800',
        fontFeatureSettings: '"cv02","cv03","cv04","cv11"'
      }
    }
  },
  colors: {
    brand: {
      primary: '#7B2D6E',
      primaryLight: '#9A3A8A',
      primaryDark: '#5C2252',
      gold: '#C9A84C',
      goldLight: '#DBC27A',
      dark: '#141018',
      gray: '#F7FAFC'
    }
  },
  fonts: {
    heading: '"Playfair Display", serif',
    body: '"Inter", sans-serif'
  },
  radii: {
    xl: '18px',
    '2xl': '22px'
  },
  shadows: {
    outline: '0 0 0 3px rgba(123, 45, 110, 0.18)',
    soft: '0 1px 2px rgba(16,24,40,0.06), 0 6px 24px rgba(16,24,40,0.08)'
  },
  semanticTokens: {
    colors: {
      'surface.bg': { default: 'white' },
      'surface.border': { default: 'gray.200' },
      'surface.subtle': { default: 'gray.50' }
    }
  },
  components: {
    Card: {
      baseStyle: {
        container: {
          borderRadius: 'xl',
          borderWidth: '1px',
          borderColor: 'surface.border',
          boxShadow: 'soft',
          bg: 'surface.bg'
        }
      }
    },
    Button: {
      baseStyle: {
        borderRadius: 'lg',
        fontWeight: 600
      },
      variants: {
        solid: (props: any) => ({
          bg: props.colorScheme === 'brand' ? 'brand.primary' : undefined,
          color: props.colorScheme === 'brand' ? 'white' : undefined,
          _hover: {
            bg:
            props.colorScheme === 'brand' ? 'brand.primaryLight' : undefined
          }
        }),
        outline: (props: any) => ({
          borderColor:
          props.colorScheme === 'brand' ? 'brand.primary' : undefined,
          color: props.colorScheme === 'brand' ? 'brand.primary' : undefined,
          _hover: {
            bg: props.colorScheme === 'brand' ? 'brand.gray' : undefined
          }
        }),
        ghost: (props: any) => ({
          borderRadius: 'lg',
          _hover: {
            bg: props.colorScheme === 'brand' ? 'rgba(123, 45, 110, 0.08)' : 'gray.100'
          }
        })
      }
    },
    Input: {
      defaultProps: { focusBorderColor: 'brand.primary' },
      variants: {
        outline: {
          field: {
            borderRadius: 'lg',
            bg: 'surface.bg'
          }
        },
        filled: {
          field: {
            borderRadius: 'lg'
          }
        }
      }
    },
    Textarea: {
      defaultProps: { focusBorderColor: 'brand.primary' },
      variants: {
        outline: {
          borderRadius: 'lg',
          bg: 'surface.bg'
        }
      }
    },
    Menu: {
      baseStyle: {
        list: {
          borderRadius: 'xl',
          borderColor: 'surface.border',
          boxShadow: 'soft',
          py: 2
        },
        item: {
          borderRadius: 'lg',
          mx: 2,
          _focus: { bg: 'gray.100' }
        }
      }
    }
  }
});

export default theme;
