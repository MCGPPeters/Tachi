using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Environment = System.Collections.Generic.IDictionary<string, object>;

namespace Tachi.Tests
{

    public static class Application
    {
        public delegate Task AppFunc(IDictionary<string, object> environment);
        public delegate AppFunc MidFunc(AppFunc appFunc);

        private static AppFunc NotFound => env =>
        {
            env["owin.ResponseStatusCode"] = 404;
            return Task.FromResult(0);
        };

        private static Func<IEnumerable<MidFunc>, MidFunc> Compose =>
            pipeline =>
                pipeline.Aggregate((current, next)
                    => appFunc
                        => current(next(appFunc)));

        /// <summary>
        /// Builds the application function from a set of pipeline off middleware functions. An application function is always terminated
        /// by a middleware that returns 404 NotFound. This indicates that there was no middleware found that
        /// would handle the request.
        /// </summary>
        /// <value>
        /// The build.
        /// </value>
        public static Func<IEnumerable<MidFunc>, AppFunc> Build => pipeline => Compose(pipeline)(NotFound);
        public static Func<AppFunc, Environment, Task> Run => (appFunc, env) => appFunc(env);
    }
}