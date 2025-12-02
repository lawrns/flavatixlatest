# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - link "Skip to main content" [ref=e3] [cursor=pointer]:
      - /url: "#main-content"
    - main [ref=e4]:
      - generic [ref=e7]:
        - img "Flavatix Logo" [ref=e12]
        - generic [ref=e13]:
          - heading "Flavatix" [level=1] [ref=e14]
          - paragraph [ref=e15]: The one place for all your tasting needs
        - generic [ref=e16]:
          - button "Sign in with Email" [ref=e17] [cursor=pointer]:
            - img [ref=e18]
            - generic [ref=e21]: Sign in with Email
          - generic [ref=e22]:
            - separator [ref=e23]
            - generic [ref=e24]: or
            - separator [ref=e25]
          - generic [ref=e26]:
            - button "Google" [ref=e27] [cursor=pointer]:
              - img [ref=e28]
              - generic [ref=e30]: Google
            - button "Apple" [ref=e31] [cursor=pointer]:
              - img [ref=e32]
              - generic [ref=e34]: Apple
          - button "Create new account" [ref=e36] [cursor=pointer]
    - status [ref=e37]
    - alert [ref=e38]
    - region "Notifications Alt+T"
  - alert [ref=e39]
```