## common
* Code prioritizes **locality**.

## repository
* Repositories contain only **simple queries**.
* Methods return the **Promise** directly without using `async`/`await`.
* `*.repository.spec.ts` files only test **query generation**.

## module
* Minimize the use of `forwardRef`.
* Create a **module per Entity**. (Entities are optional based on abstraction level or purpose).

## service
* Entity CRUD (Create, Update, Delete) must be performed by importing the **corresponding Entity's service module**.
* If Entity creation lacks independent business logic, perform the operation within the **business-relevant service** rather than the Entity-named service.
* Use the **local repository** directly for `select` queries.
* **Prohibit** direct imports of repositories or services from external modules.

## controller
* Define absolute paths in method-level decorators instead of using base paths in controller decorators for better grep-ability. 