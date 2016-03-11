using System.Collections.Generic;
using System.Dynamic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using eVision.InteractivePnid.Tests.Fixtures.LibOwin;
using AppFunc = System.Func<System.Collections.Generic.IDictionary<string, object>,
    System.Threading.Tasks.Task
    >;

namespace eVision.InteractivePnid.Tests.Fixtures
{
    public class TestableOwinEdgeApplication
    {
        protected System.Func<IDictionary<string, object>,
    Task
    > AppFunc { get; set; }

        public async Task<object> Invoke(ExpandoObject input)
        {
            var environment = EnsureValidOwinRequestEnvironment(input);
            EnsureRequiredOwinResponseEnvironmentKeys(environment);

            await AppFunc(environment);

            var owinResponseEnvironment = EnsureValidOwinResponseEnvironment(environment);
            return owinResponseEnvironment;
        }

        private static void EnsureRequiredOwinResponseEnvironmentKeys(IDictionary<string, object> environment)
        {
            environment.Add(OwinConstants.ResponseHeaders, new Dictionary<string, string[]>());
        }

        private static IDictionary<string, object> EnsureValidOwinRequestEnvironment(
            IDictionary<string, object> environment)
        {
            var requestBody = (byte[]) environment[OwinConstants.RequestBody];
            environment[OwinConstants.RequestBody] = new MemoryStream(requestBody);
            var headers = (IDictionary<string, object>) environment[OwinConstants.RequestHeaders];
            environment[OwinConstants.RequestHeaders] = headers.ToDictionary(pair => pair.Key,
                pair => new[] {pair.Value.ToString()});
            return environment;
        }


        /// <summary>
        ///     Ensures that the owin response data contains all required fields
        ///     http://owin.org/spec/spec/owin-1.0.0.html#Paths
        /// </summary>
        /// <param name="environment">The environment.</param>
        private static IDictionary<string, object> EnsureValidOwinResponseEnvironment(
            IDictionary<string, object> environment)
        {
            // transform the response stream to a byte[], so that edge can marshal it to a Buffer
            if (environment.ContainsKey(OwinConstants.ResponseBody))
            {
                environment[OwinConstants.ResponseBody] =
                    ((MemoryStream) environment[OwinConstants.ResponseBody]).GetBuffer();
            }
            else
            {
                environment[OwinConstants.ResponseBody] = new byte[0];
            }

            if (!environment.ContainsKey(OwinConstants.RequestProtocol))
            {
                // in accordance with the owin spec
                environment[OwinConstants.RequestProtocol] = environment[OwinConstants.RequestProtocol];
            }

            environment[OwinConstants.OwinVersion] = "1.0";

            return environment;
        }
    }
}